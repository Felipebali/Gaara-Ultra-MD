// plugins/ruletabanF.js
let handler = async (m, { conn, groupMetadata, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return;

    if (!isAdmin && !isOwner) return;

    const text = (m.text || '').toString().trim();
    if (text.toLowerCase() !== 'f') return;

    const participants = groupMetadata?.participants || [];

    // Verificar que el bot sea admin correctamente
    const bot = participants.find(p => p.id === conn.user.jid);
    const botIsAdmin = bot && (
      bot.admin === 'admin' ||
      bot.admin === 'superadmin' ||
      bot.isAdmin === true ||
      bot.isSuperAdmin === true
    );

    if (!botIsAdmin) return conn.sendMessage(m.chat, { text: '❗ Necesito ser administrador para eliminar usuarios.' });

    const BOT_OWNERS = ['59896026646','59898719147'];
    const ownersJids = BOT_OWNERS.map(n => n+'@s.whatsapp.net');

    const elegibles = participants
      .filter(p => {
        const jid = p.id;
        const isPartAdmin = p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin || p.isSuperAdmin;
        const isBot = jid === conn.user.jid;
        const isGroupOwner = groupMetadata.owner && jid === groupMetadata.owner;
        const isBotOwner = ownersJids.includes(jid);
        return !isPartAdmin && !isBot && !isGroupOwner && !isBotOwner;
      })
      .map(p => p.id);

    if (!elegibles.length) return conn.sendMessage(m.chat, { text: '❌ No hay usuarios elegibles.' });

    const elegido = elegibles[Math.floor(Math.random()*elegibles.length)];

    await conn.sendMessage(m.chat, {
      text: `🎯 Ruleta activada por @${m.sender.split('@')[0]}...\nGirando la suerte...`,
      mentions: [m.sender]
    });

    await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove');

    await conn.sendMessage(m.chat, {
      text: `💀 El destino decidió... @${elegido.split('@')[0]} fue eliminado del grupo.`,
      mentions: [elegido]
    });

  } catch (err) {
    console.error('ruletabanF:', err);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al ejecutar la ruleta.' });
  }
};

handler.customPrefix = /^\s*f\s*$/i;
handler.command = [''];
handler.register = true;
handler.group = true;

export default handler;
