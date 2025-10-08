// plugins/wipe.js
let handler = async (m, { conn, groupMetadata }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    const participants = groupMetadata?.participants || [];

    // Verificar que el bot sea admin
    const botId = conn.user?.id || conn.user?.jid;
    const botParticipante = participants.find(p => p.id === botId);
    if (!botParticipante?.admin) {
      return m.reply('❌ No puedo ejecutar esto: debo ser *admin* del grupo.');
    }

    // Expulsar a todos los participantes (incluidos admins, owners, etc.)
    for (let p of participants) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [p.id], 'remove');
        await new Promise(res => setTimeout(res, 300)); // evitar rate limit
      } catch (e) {
        console.error('wipe: no se pudo eliminar', p.id, e);
      }
    }

    // No enviamos mensaje de confirmación
    return;

  } catch (err) {
    console.error(err);
    try {
      await m.reply('✖️ Ocurrió un error al ejecutar el wipe. Revisa la consola del bot.');
    } catch(e){/* ignorar */ }
  }
};

handler.command = ['wipe','killgroup','delall'];
handler.group = true;
handler.owner = true; // solo el owner puede ejecutar

export default handler;
