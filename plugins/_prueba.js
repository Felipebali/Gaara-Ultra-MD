// plugins/autokick-te.js

let palabrasProhibidas = ['.te', '.te eliminó'];

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  try {
    if (!m.isGroup) return; // solo grupos
    if (!isBotAdmin) return; // el bot debe ser admin

    // Obtener texto real del mensaje
    let texto = '';
    if (m.text) texto = m.text.toLowerCase();
    else if (m.message?.conversation) texto = m.message.conversation.toLowerCase();
    else if (m.message?.extendedTextMessage?.text) texto = m.message.extendedTextMessage.text.toLowerCase();
    if (!texto) return;

    // Verificar si contiene alguna palabra prohibida
    let encontrado = palabrasProhibidas.some(p => texto.startsWith(p));
    if (!encontrado) return;

    // Owner del bot
    let owners = global.owner ? global.owner.map(v => v.replace(/[^0-9]/g, '')) : [];
    let senderNum = m.sender.replace(/[^0-9]/g, '');

    // Owner detectado
    if (owners.includes(senderNum) || isOwner) {
      await conn.sendMessage(m.chat, { text: '🛡️ Owner detectado, no te voy a expulsar 😉' }, { quoted: m });
      return;
    }

    // Admin detectado
    if (isAdmin) {
      await conn.sendMessage(m.chat, { text: '⚠️ Admin detectado. No puedo expulsarte, evitá usar eso.' }, { quoted: m });
      return;
    }

    // Usuario normal → expulsión
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    await conn.sendMessage(m.chat, { text: '🚫 Usuario eliminado automáticamente por usar palabra prohibida.' });

  } catch (err) {
    console.error('Error en autokick-te:', err);
  }
};

// Importante: este plugin debe ejecutarse antes que los comandos normales
handler.before = true;
handler.group = true;
handler.register = true;

export default handler;
