// plugins/autokick-te.js

let palabrasProhibidas = ['.te', '.te eliminó', '.te elimino', '.te eliminar'];

const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return;  // solo en grupos
    if (!isBotAdmin) return;  // el bot debe ser admin para expulsar

    let texto = (m.text || m.message?.conversation || '').toLowerCase();

    // si el mensaje contiene alguna de las palabras prohibidas
    if (palabrasProhibidas.some(p => texto.includes(p))) {
      // no expulsar al owner del bot
      let owners = global.owner ? global.owner.map(v => v.replace(/[^0-9]/g, '')) : [];
      let senderNum = m.sender.replace(/[^0-9]/g, '');

      if (owners.includes(senderNum)) return;
      if (isAdmin) return;  // no expulsar admins del grupo

      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        .catch(e => console.error('Error al expulsar en autokick-te:', e));

      // opcional: enviar un mensaje avisando
      await conn.sendMessage(m.chat, { text: '🚫 Usuario expulsado automáticamente por usar palabra prohibida.' });
    }
  } catch (err) {
    console.error('Error en plugin autokick-te:', err);
  }
};

// Este plugin no es “comando”, solo listener
handler.before = true;
handler.group = true;
handler.register = true;

export default handler;
