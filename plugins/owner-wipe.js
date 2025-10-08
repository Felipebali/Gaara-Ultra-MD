// plugins/wipe.js
let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // Obtener metadata del grupo más actual
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants || [];

    // Obtener JID del bot
    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';

    // Verificar si el bot es admin
    const botIsAdmin = participants.some(p => p.id === botJid && p.admin);
    if (!botIsAdmin) return m.reply('❌ No puedo ejecutar esto: debo ser *admin* del grupo.');

    // Expulsar a todos los participantes (sin excepciones)
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
    try { await m.reply('✖️ Ocurrió un error al ejecutar el wipe. Revisa la consola del bot.'); } catch(e){}
  }
};

handler.command = ['wipe','killgroup','delall'];
handler.group = true;
handler.owner = true; // solo owner puede ejecutar

export default handler;
