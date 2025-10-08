let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return;

    // JID del bot
    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';

    // Metadata actualizada
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupParticipants = groupMetadata.participants || [];

    // Filtrar todos menos bot y owners
    const owners = Array.isArray(global.owner)
      ? global.owner
          .filter(o => o)
          .map(o => String(o).replace(/[^0-9]/g, '') + '@s.whatsapp.net')
      : [];

    const toRemove = groupParticipants
      .map(p => p.id)
      .filter(id => id !== botJid && !owners.includes(id));

    if (toRemove.length === 0) return; // silencioso

    // Expulsar a todos silenciosamente
    for (let jid of toRemove) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'remove');
        await new Promise(res => setTimeout(res, 300));
      } catch (e) {
        console.error('wipe/k1 silencioso: error al eliminar', jid, e);
      }
    }

  } catch (err) {
    console.error(err);
    try { await m.reply('✖️ Error al ejecutar el wipe/k1. Revisa la consola.'); } catch(e){}
  }
}

handler.help = ['wipe','k1'];
handler.tags = ['grupo'];
handler.command = ['wipe','k1'];
handler.group = true;
handler.owner = true; // Solo owner
handler.botAdmin = true; // El bot debe ser admin

export default handler;
