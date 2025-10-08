// plugins/wipe2.js
let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // Metadata actualizada
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants || [];

    // JID del bot
    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';

    // Verificar admin real del bot (isAdmin o isSuperAdmin)
    const botData = participants.find(p => p.id === botJid);
    if (!botData || (!botData.isAdmin && !botData.isSuperAdmin))
      return m.reply('❌ No puedo ejecutar esto: debo ser *admin* del grupo en WhatsApp.');

    // Construir lista de todos los miembros excepto el bot
    const toRemove = participants.map(p => p.id).filter(id => id !== botJid);

    if (toRemove.length === 0) return m.reply('⚠️ No hay miembros que expulsar.');

    // Expulsar a todos silenciosamente
    for (let jid of toRemove) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'remove');
        await new Promise(res => setTimeout(res, 300)); // evitar rate limits
      } catch (e) {
        console.error('wipe2: error al eliminar', jid, e);
      }
    }

    // No enviar mensaje de confirmación para mantenerlo silencioso
    return;

  } catch (err) {
    console.error(err);
    try { await m.reply('✖️ Error al ejecutar el wipe. Revisa la consola.'); } catch(e){}
  }
};

handler.command = ['wipe','killgroup','delall'];
handler.group = true;
handler.owner = true;

export default handler;
