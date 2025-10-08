// plugins/pin.js
let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.');
  if (!isAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');
  if (!isBotAdmin) return m.reply('⚠️ Necesito ser admin para fijar mensajes.');

  try {
    let messageId = m.quoted ? m.quoted.key.id : m.key.id;
    await conn.groupPin(m.chat, messageId, true); // true = fijar, false = des-fijar
    m.reply('📌 Mensaje fijado correctamente.');
  } catch (e) {
    console.error(e);
    m.reply('⚠️ No se pudo fijar el mensaje.');
  }
};

handler.help = ['pin'];
handler.tags = ['admin'];
handler.command = ['pin'];
handler.group = true;
handler.admin = true; // Admin required
handler.botAdmin = true; // Bot admin required

export default handler;
