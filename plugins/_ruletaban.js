// plugins/ruletabanF.js
// Activador: letra "F" o "f" (sin prefijo)
// Solo admins o owners pueden usarlo
// Expulsa un usuario aleatorio que no sea admin, bot ni owner
// No cita el mensaje

let handler = async (m, { conn, groupMetadata, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return;

    // Solo admins o owners
    if (!isAdmin && !isOwner) return;

    const text = (m.text || '').toString().trim();
    if (text.toLowerCase() !== 'f') return; // activador exacto

    const participants = groupMetadata?.participants || [];

    // Verificar que el bot sea admin
    const bot = participants.find(p => (p.id === conn.user.jid));
    const botIsAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin' || bot.isAdmin || bot.isSuperAdmin);
    if (!botIsAdmin) return conn.sendMessage(m.chat, { text: '❗ Necesito ser administrador para eliminar usuarios.' });

    // Owners del bot
    const BOT_OWNERS = ['59896026646','59898719147'];
    const ownersJids = BOT_OWNERS.map(n => n + '@s.whatsapp.net');

    // Filtrar participantes elegibles
    const elegibles = participants
      .filter(p => {
        const jid = p.id;
        const isPartAdmin = p.admin || p.isAdmin || p.isSuperAdmin;
        const isBot = jid === conn.user.jid;
        const isGroupOwner = groupMetadata.owner && jid === groupMetadata.owner;
        const isBotOwner = ownersJids.includes(jid);
        return !isPartAdmin && !isBot && !isGroupOwner && !isBotOwner;
      })
      .map(p => p.id);

    if (!elegibles.length) return conn.sendMessage(m.chat, { text: '❌ No hay usuarios elegibles para expulsar.' });

    // Elegir uno al azar
    const elegido = elegibles[Math.floor(Math.random() * elegibles.length)];

    // Mensaje inicial
    await conn.sendMessage(m.chat, { 
      text: `🎯 Ruleta activada por @${m.sender.split('@')[0]}...\nGirando la suerte...`,
      mentions: [m.sender] 
    });

    // Expulsar
    await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove');

    // Mensaje final sin citar
    await conn.sendMessage(m.chat, { 
      text: `💀 El destino decidió... @${elegido.split('@')[0]} fue eliminado del grupo.`,
      mentions: [elegido] 
    });

  } catch (err) {
    console.error('ruletabanF:', err);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al ejecutar la ruleta.' });
  }
};

// Activador sin prefijo
handler.customPrefix = /^\s*f\s*$/i;
handler.command = [''];
handler.register = true;
handler.group = true;

export default handler;
