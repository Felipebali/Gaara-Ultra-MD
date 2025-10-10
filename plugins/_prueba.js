// AutoKick por comando .te
let palabrasProhibidas = ['.te', '.te eliminó', '.te elimino', '.te eliminar']; // podés agregar más

let handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return; // solo en grupos
  if (!isBotAdmin) return; // si el bot no es admin no puede expulsar

  // mensaje convertido a minúsculas para comparar
  let texto = (m.text || '').toLowerCase();

  // si el mensaje incluye alguna palabra prohibida
  if (palabrasProhibidas.some(p => texto.includes(p))) {

    // no expulsar al owner
    let owners = global.owner?.map(v => v.replace(/[^0-9]/g,'')) || [];
    let senderNum = m.sender.replace(/[^0-9]/g,'');
    if (owners.includes(senderNum)) return;

    // no expulsar admins
    if (isAdmin) return;

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      await conn.sendMessage(m.chat, { text: `🚫 Usuario eliminado automáticamente.` });
    } catch (e) {
      console.log(e);
    }
  }
};
handler.group = true;
export default handler;
