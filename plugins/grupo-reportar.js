// plugins/reportar.js
let handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply('⚠️ Debes responder un mensaje para reportarlo.');

  // Enviar reporte al dueño sin mostrar mensajes raros
  const owners = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net']; // dueños
  for (let owner of owners) {
    await conn.sendMessage(owner, {
      text: `🚨 *Nuevo reporte recibido*\n\n📩 *Chat:* ${m.chat}\n🔗 *Mensaje reportado:*`,
    });

    // Reenvía el mensaje original citado
    await conn.copyNForward(owner, m.quoted, true);
  }

  // Respuesta al grupo
  await conn.sendMessage(m.chat, {
    text: '✅ El mensaje fue reportado a los administradores.',
  }, { quoted: m.quoted }); // acá cita el mensaje reportado
};

handler.command = ['reportar', 'report'];
handler.group = true;

export default handler;
