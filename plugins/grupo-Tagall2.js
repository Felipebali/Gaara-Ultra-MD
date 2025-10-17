// plugins/tagall2-militar-rudo.js
let handler = async (m, { conn, groupMetadata, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  if (!(isAdmin || isOwner)) {
    // Bloqueo rudo para usuarios no autorizados
    const rudoFail = [
      '⛔ ACCESO DENEGADO – RANGO INSUFICIENTE\nEste comando es solo para OFICIALES DEL GRUPO.\nRetrocedé soldado antes de terminar en la lista negra.',
      '❌ ALERTA: No eres oficial. Solo admins y owners pueden ejecutar esta orden.\nVuelve a tu puesto inmediatamente.',
      '⚠️ ERROR DE RANGO: No estás autorizado. Mantente fuera de esta operación o enfrentarás sanciones.'
    ];
    return m.reply(rudoFail[Math.floor(Math.random() * rudoFail.length)]);
  }

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes
    .map(p => (p.id ? (conn.decodeJid ? conn.decodeJid(p.id) : p.id) : null))
    .filter(Boolean);

  if (mencionados.length === 0) return m.reply('❌ No pude obtener la lista de participantes.');

  // Frases militares rudas aleatorias para cada ejecución
  const frases = [
    'Unidad: MOVILIZACIÓN INMEDIATA.\nQuien no responda será marcado en el acta.',
    'No hay piedad. Esta operación no espera a nadie.',
    'Presentarse AHORA. Faltas serán sancionadas con mano dura.',
    'Orden directa: todos los soldados deben responder sin demora.'
  ];

  const cuerpoBase = [
    '🪖⚔️ ORDEN: OPERACIÓN ANULACIÓN ⚔️🪖',
    '────────────────────────────',
    frases[Math.floor(Math.random() * frases.length)],
    '',
    'Adjunto detalles → 🔒 https://miunicolink.local/tagall-FelixCat',
    '',
    '────────────────────────────',
    '🛡 División táctica Felix-Cat'
  ];

  const cuerpo = cuerpoBase.join('\n');

  // Construimos extendedTextMessage con contextInfo.mentionedJid para mención oculta
  const payload = {
    extendedTextMessage: {
      text: cuerpo,
      contextInfo: {
        mentionedJid: mencionados
      }
    }
  };

  // Enviamos 2 mensajes (x2), sin quoted ni reply
  for (let i = 0; i < 2; i++) {
    try {
      await conn.relayMessage(m.chat, payload, {}); // sin reply
    } catch (e) {
      // fallback
      try {
        await conn.sendMessage(m.chat, payload);
      } catch (err) {
        console.error('tagall2 rudo: error al enviar mensaje', err);
      }
    }
    await new Promise(res => setTimeout(res, 600)); // pausa para evitar bloqueos
  }
};

handler.help = ['tagall2'];
handler.tags = ['grupos'];
handler.command = ['tagall2', 'ordenruda', 'operacionruda'];
handler.group = true;
handler.admin = true;

export default handler;
