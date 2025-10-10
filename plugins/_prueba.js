// plugins/autokick-te.js

let palabrasProhibidas = ['.te', '.te eliminó', '.te elimino', '.te eliminar'];

const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return;  // solo grupos
    if (!isBotAdmin) return; // si el bot no es admin, no hace nada

    let texto = (m.text || m.message?.conversation || '').toLowerCase();

    if (palabrasProhibidas.some(p => texto.includes(p))) {

      // Detectar dueño del bot
      let owners = global.owner ? global.owner.map(v => v.replace(/[^0-9]/g, '')) : [];
      let senderNum = m.sender.replace(/[^0-9]/g, '');

      // Si lo usa un OWNER
      if (owners.includes(senderNum) || isOwner) {
        await conn.sendMessage(m.chat, {
          text: `🛡️ Tranquilo dueño, detecté el mensaje prohibido pero no te voy a expulsar 😉`
        }, { quoted: m });
        return;
      }

      // Si lo usa un ADMIN
      if (isAdmin) {
        await conn.sendMessage(m.chat, {
          text: `⚠️ Admin detectado.\nNo puedo expulsarte, pero evitá usar eso.`
        }, { quoted: m });
        return;
      }

      // Si lo usa un usuario normal = expulsión
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      await conn.sendMessage(m.chat, {
        text: `🚫 Usuario eliminado automáticamente por usar comando prohibido.`
      });

    }
  } catch (err) {
    console.error('Error en autokick-te.js:', err);
  }
};

handler.before = true;
handler.group = true;
handler.register = true;

export default handler;
