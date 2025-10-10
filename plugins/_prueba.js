// plugins/autokick-te.js

let palabrasProhibidas = ['.te', '.te eliminó', '.te elimino', '.te eliminar'];

const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return; // solo grupos
    if (!isBotAdmin) return; // el bot debe ser admin

    // Obtener el texto real del mensaje
    let texto = '';
    if (m.text) texto = m.text.toLowerCase();
    else if (m.message?.conversation) texto = m.message.conversation.toLowerCase();
    else if (m.message?.extendedTextMessage?.text) texto = m.message.extendedTextMessage.text.toLowerCase();

    if (!texto) return; // si no hay texto, salimos

    if (palabrasProhibidas.some(p => texto.includes(p))) {

      // dueños del bot
      let owners = global.owner ? global.owner.map(v => v.replace(/[^0-9]/g, '')) : [];
      let senderNum = m.sender.replace(/[^0-9]/g, '');

      // owner detectado
      if (owners.includes(senderNum) || isOwner) {
        await conn.sendMessage(m.chat, {
          text: `🛡️ Tranquilo dueño, detecté el mensaje prohibido pero no te voy a expulsar 😉`
        }, { quoted: m });
        return;
      }

      // admin detectado
      if (isAdmin) {
        await conn.sendMessage(m.chat, {
          text: `⚠️ Admin detectado.\nNo puedo expulsarte, pero evitá usar eso.`
        }, { quoted: m });
        return;
      }

      // usuario normal → expulsión
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        .catch(e => console.log('Error expulsando:', e));

      await conn.sendMessage(m.chat, {
        text: `🚫 Usuario eliminado automáticamente por usar comando prohibido.`
      });

    }
  } catch (err) {
    console.error('Error en autokick-te.js:', err);
  }
};

// escuchamos antes de cualquier comando
handler.before = true;
handler.group = true;
handler.register = true;

export default handler;
