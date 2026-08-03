// ============================================================================
// Controlador de Checkout (cobro con Openpay)
// ----------------------------------------------------------------------------
// Recibe el token de la tarjeta que el frontend generó con Openpay (la tarjeta
// nunca pasa por este servidor) y ejecuta el cargo contra la API de Openpay con
// la llave privada. Soporta dos casos:
//   - Usuario con sesión: se cobra a su cuenta.
//   - Invitado (sin sesión): se crea/reutiliza una cuenta "invitada" por correo,
//     que luego puede reclamarse al registrarse con ese mismo correo.
// Si el cobro es exitoso, registra la transacción y descuenta el stock de boletos.
// La URL de Openpay (sandbox vs producción) sale de OPENPAY_BASE_URL.
//
// El importe NO se toma del cuerpo de la petición: se calcula aquí a partir del
// precio guardado en la base de datos. De lo contrario cualquiera podría editar
// la petición desde el navegador y pagar la cantidad que quisiera.
//
// El orden de las operaciones importa: primero se comprueba que haya boletos,
// luego se cobra, y solo si Openpay confirma el cargo como completado se
// registra la venta. Cobrar antes de mirar el inventario deja al comprador
// pagado y sin nada.
// ============================================================================
const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Transaccion = require('../models/transaccionModel');
const Usuario = require('../models/usuarioModel');
const Evento = require('../models/eventoModel');
const Paquete = require('../models/paqueteModel');

// Tope de espera del cargo. Sin límite, una caída de Openpay deja la petición
// colgada y al comprador sin saber si se le cobró.
const TIMEOUT_MS = 20000;

// Un cargo solo cuenta como pagado cuando Openpay lo devuelve completado. Los
// demás estados (in_progress de 3D Secure, charge_pending, failed) no son un
// cobro efectivo y no deben generar boletos.
const ESTADO_PAGADO = 'completed';

// Límites de longitud que impone la API en los campos que mandamos.
const MAX_NOMBRE = 100;
const MAX_DESCRIPCION = 250;

// Forma aceptada para la referencia que manda el navegador. Se valida en vez
// de confiar: acaba siendo la llave primaria de `transaccion`, que es
// VARCHAR(50), y el order_id de Openpay.
const FORMATO_REFERENCIA = /^FMDS-[A-Za-z0-9-]{1,40}$/;

const nuevaReferencia = () => `FMDS-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

// Mensajes en español para los códigos de error de Openpay. La tabla oficial
// está en https://documents.openpay.mx/docs/api/#códigos-de-error y las
// tarjetas que provocan cada uno, en https://documents.openpay.mx/docs/testing
// Sin esto el comprador ve la descripción original, que viene en inglés y habla
// de conceptos internos de la pasarela.
const MENSAJES_OPENPAY = {
  1001: 'Los datos del pago no tienen el formato esperado.',
  1003: 'Alguno de los datos del pago no es válido.',
  1004: 'El servicio de pagos no está disponible en este momento. Intenta más tarde.',
  1006: 'Ese pago ya se había procesado. Revisa tus boletos antes de volver a intentar.',
  1007: 'El banco no autorizó la transferencia de los fondos.',
  1008: 'La cuenta de cobro está desactivada. Escríbenos para resolverlo.',
  2004: 'El número de tarjeta no es válido. Revísalo y vuelve a intentar.',
  2005: 'La fecha de expiración ya pasó. Revisa el mes y el año de tu tarjeta.',
  2006: 'Falta el código de seguridad (CVV2) de la tarjeta.',
  2007: 'Ese número es de una tarjeta de prueba y solo funciona en el ambiente de pruebas.',
  2009: 'El código de seguridad (CVV2) no es correcto.',
  3001: 'El banco declinó la tarjeta. Intenta con otra o comunícate con tu banco.',
  3002: 'La tarjeta ya expiró.',
  3003: 'La tarjeta no tiene fondos suficientes.',
  3004: 'La tarjeta fue reportada como robada.',
  3005: 'El sistema antifraude rechazó la operación. Intenta con otra tarjeta.',
  3006: 'Esta operación no está permitida para esta tarjeta.',
  3008: 'La tarjeta no está habilitada para compras por internet.',
  3009: 'La tarjeta fue reportada como perdida.',
  3010: 'El banco restringió esta tarjeta. Comunícate con tu banco.',
  3011: 'El banco pidió retener la tarjeta. Comunícate con tu banco.',
  3012: 'Necesitas autorización de tu banco para un pago de este monto.',
};

// Traduce el código de Openpay al estado HTTP que devolvemos nosotros.
// El 401 nunca se reenvía: en la tabla de Openpay significa que nuestras llaves
// están mal (código 1002), pero el frontend interpreta cualquier 401 como sesión
// expirada y cerraría la sesión del comprador por un problema del servidor.
const estadoHttp = (codigo, httpOpenpay) => {
  if (codigo === 1002 || codigo === 1010) return 500; // llaves mal configuradas: es nuestro
  if (codigo === 1000 || codigo === 1004) return 502; // falló Openpay, no el comprador
  const n = Number(httpOpenpay);
  if (n === 401 || !(n >= 400 && n < 500)) return 500;
  return n;
};

// Resuelve qué se está comprando y cuánto cuesta, siempre según la base de
// datos. Devuelve { idEvento, cantidad, monto, titulo } o { error }.
// - Con idPaquete: el precio y la cantidad de boletos salen del paquete.
// - Sin idPaquete: se cobra el precio del evento por la cantidad pedida.
const resolverCompra = async ({ idPaquete, idEvento, cantidad }) => {
  let idDelEvento;
  let unidades;
  let monto;

  if (idPaquete) {
    const paquete = await Paquete.getById(idPaquete);
    if (!paquete) return { error: 'El paquete indicado no existe' };
    if (!paquete.activo) return { error: 'Ese paquete ya no está disponible' };
    idDelEvento = paquete.idEvento;
    unidades = paquete.cantidadBoletos;
    monto = Number(paquete.precio);
  } else {
    unidades = Number(cantidad);
    if (!Number.isInteger(unidades) || unidades < 1) {
      return { error: 'La cantidad de boletos no es válida' };
    }
    idDelEvento = idEvento;
  }

  const evento = await Evento.getById(idDelEvento);
  if (!evento) return { error: 'El evento indicado no existe' };

  if (monto === undefined) {
    monto = Number((Number(evento.precio) * unidades).toFixed(2));
  }

  // Openpay exige un importe mayor a cero: si el precio no está capturado, es
  // mejor decirlo aquí que recibir un 1003 genérico de la pasarela.
  if (!(monto > 0)) {
    return { error: 'Este evento todavía no tiene un precio configurado' };
  }

  // El inventario se comprueba antes del cargo. Es una comprobación optimista
  // (dos compras simultáneas podrían pasarla las dos), por eso el descuento en
  // transaccionModel vuelve a validarlo dentro de la transacción de la base.
  const disponibles = Number(evento.stockBoletos);
  if (!(disponibles >= unidades)) {
    return {
      error: disponibles > 0
        ? `Solo quedan ${disponibles} boleto(s) disponibles para este evento.`
        : 'Los boletos de este evento están agotados.',
    };
  }

  return { idEvento: evento.idEvento, cantidad: unidades, monto, titulo: evento.titulo };
};

const checkout = async (req, res) => {
  const { token_id, idEvento, cantidad, idPaquete, deviceSessionId, nombre, correo, referencia } = req.body;

  if (!token_id || (!idPaquete && (!idEvento || !cantidad))) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // La API lo marca como requerido y es lo que alimenta al antifraude: si el
  // script de Openpay no cargó en el navegador, conviene decirlo aquí y no
  // dejar que la pasarela responda con un error de formato.
  if (!deviceSessionId) {
    return res.status(400).json({
      error: 'No se pudo identificar tu dispositivo. Recarga la página e intenta de nuevo.',
    });
  }

  // El folio se fija ANTES de cobrar y cumple tres papeles a la vez: order_id
  // en Openpay, id de la transacción en nuestra base y referencia para el
  // comprador. Que sean el mismo valor es lo que permite conciliar el
  // dashboard de Openpay contra la tabla `transaccion`.
  //
  // Lo genera el navegador y se mantiene mientras dure el intento de compra,
  // porque Openpay trata el order_id como llave de idempotencia: un cargo ya
  // cobrado con ese folio se rechaza con el código 1006, mientras que uno
  // declinado lo libera. Así un doble clic o un reintento tras un timeout no
  // pueden cobrar dos veces, pero volver a intentar tras un rechazo sí funciona.
  const folio = FORMATO_REFERENCIA.test(referencia || '') ? referencia : nuevaReferencia();

  let cargo;
  let compra;
  let usuario;

  try {
    compra = await resolverCompra({ idPaquete, idEvento, cantidad });
    if (compra.error) return res.status(400).json({ error: compra.error });

    if (req.usuario) {
      // Compra con sesión iniciada
      usuario = await Usuario.findById(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } else {
      // Compra como invitado: se liga a una cuenta invitada por correo
      if (!nombre || !correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return res.status(400).json({ error: 'Nombre y correo válido son requeridos para comprar' });
      }
      usuario = await Usuario.findByCorreo(correo.toLowerCase().trim());
      if (!usuario) {
        const hash = await bcrypt.hash(crypto.randomUUID(), 10);
        const id = await Usuario.create(nombre.trim(), correo.toLowerCase().trim(), hash, 'Usuario General', 1);
        usuario = { idUsuario: id, nombre: nombre.trim(), correo: correo.toLowerCase().trim() };
      }
    }

    const merchantId = process.env.OPENPAY_MERCHANT_ID;
    const privateKey = process.env.OPENPAY_PRIVATE_KEY;
    // Para pasar a producción basta definir OPENPAY_BASE_URL=https://api.openpay.mx en el .env
    const baseUrl = process.env.OPENPAY_BASE_URL || 'https://sandbox-api.openpay.mx';
    const url = `${baseUrl}/v1/${merchantId}/charges`;

    const descripcion = `${compra.titulo || 'Boletos FMDS'} — ${compra.cantidad} boleto(s)`;

    cargo = await axios.post(url, {
      source_id: token_id,
      method: 'card',
      amount: compra.monto,
      currency: 'MXN',
      description: descripcion.slice(0, MAX_DESCRIPCION),
      order_id: folio,
      device_session_id: deviceSessionId,
      customer: {
        name: String(usuario.nombre || '').slice(0, MAX_NOMBRE),
        email: usuario.correo,
      },
    }, {
      auth: {
        username: privateKey,
        password: '',
      },
      timeout: TIMEOUT_MS,
    });

  } catch (err) {
    const datos = err.response?.data;
    const codigo = Number(datos?.error_code);

    if (codigo) {
      // request_id es el dato que pide el soporte de Openpay para rastrear una
      // operación, así que se registra junto con el código y nuestro folio.
      console.error('OPENPAY RECHAZÓ EL CARGO:', {
        folio,
        error_code: codigo,
        http_code: datos.http_code,
        request_id: datos.request_id,
        description: datos.description,
      });
      return res.status(estadoHttp(codigo, datos.http_code)).json({
        error: MENSAJES_OPENPAY[codigo] || 'No se pudo procesar el pago. Verifica los datos de tu tarjeta.',
      });
    }

    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      console.error('OPENPAY NO RESPONDIÓ A TIEMPO:', { folio });
      return res.status(504).json({
        error: 'El banco tardó demasiado en responder. Revisa tu estado de cuenta antes de volver a intentar.',
      });
    }

    console.error('ERROR CHECKOUT:', err.message);
    return res.status(500).json({ error: 'Error al procesar el pago' });
  }

  // A partir de aquí Openpay respondió 200, pero eso no significa cobrado: hay
  // que mirar el estado. Si la cuenta tiene 3D Secure activado, el cargo vuelve
  // como in_progress con una URL de autenticación del banco. Ese flujo no está
  // implementado, así que no se registra la venta ni se descuentan boletos.
  const estado = String(cargo.data.status || '').toLowerCase();
  if (estado !== ESTADO_PAGADO) {
    console.error('CARGO NO COMPLETADO:', {
      folio,
      openpay_id: cargo.data.id,
      estado,
      requiere_redireccion: cargo.data.payment_method?.url || null,
    });
    return res.status(402).json({
      error: `El banco dejó el pago pendiente de confirmación, así que todavía no podemos apartar tus boletos. Si ves un cargo en tu estado de cuenta, escríbenos con la referencia ${folio}.`,
    });
  }

  let idTransaccion;
  try {
    idTransaccion = await Transaccion.createTransaccion(
      usuario.idUsuario,
      compra.monto,
      [{ idEvento: compra.idEvento, cantidad: compra.cantidad }],
      folio
    );
  } catch (errBd) {
    // El dinero ya se cobró. Se deja constancia con el id de Openpay para poder
    // devolverlo o capturar la venta a mano, y el comprador se lleva la
    // referencia con la que reclamar.
    console.error('COBRO SIN REGISTRAR — REVISAR A MANO:', {
      folio,
      openpay_id: cargo.data.id,
      monto: compra.monto,
      correo: usuario.correo,
      motivo: errBd.codigo || errBd.message,
    });
    return res.status(409).json({
      error: `Tu pago se procesó, pero no alcanzamos a apartar los boletos. Escríbenos con la referencia ${folio} y lo resolvemos.`,
    });
  }

  res.status(201).json({
    message: 'Pago exitoso',
    idTransaccion,
    referencia: folio,
    montoCobrado: compra.monto,
    cantidad: compra.cantidad,
    openpay_id: cargo.data.id,
    status: cargo.data.status,
  });
};

module.exports = { checkout };
