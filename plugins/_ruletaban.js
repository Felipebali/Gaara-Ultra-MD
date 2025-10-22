// plugins/ruletabanF.js
// Activador: letra "F" o "f" (sin prefijo)
// Solo admins o owners pueden usarlo
// Expulsa un usuario aleatorio que no sea admin, bot ni owner

let handler = async (m, { conn, groupMetadata, participants, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return;

    // Solo admins o owners pueden usarlo
    if (!isAdmin && !isOwner) return;

    const text = (m.text || '').toString().trim();
    if (text.toLowerCase() !== 'f') return; // activador exacto

    // Verificar que el bot sea admin
    const botIsAdmin = participants.some(p => p.id === conn.user.jid && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (!botIsAdmin) return conn.reply(m.chat, '❗ Necesito ser administrador para eliminar usuarios.', m);

    // Owners del bot
    const BOT_OWNERS = ['59896026646','59898719147'];
    const ownersJids = BOT_OWNERS.map(n => n + '@s.whatsapp.net');

    // Filtrar participantes elegibles
    const elegibles = (groupMetadata?.participants || []).filter(p => {
      const jid = p.id;
      const isPartAdmin = !!p.admin;
      const isBot = jid === conn.user.jid;
      const isGroupOwner = groupMetadata.owner && jid === groupMetadata.owner;
      const isBotOwner = ownersJids.includes(jid);
      return !isPartAdmin && !isBot && !isGroupOwner && !isBotOwner;
    });

    if (!elegibles.length) return conn.reply(m.chat, '❌ No hay usuarios elegibles para expulsar.', m);

    // Elegir uno al azar
    const elegido = elegibles[Math.floor(Math.random() * elegibles.length)].id;

    // Mensaje inicial
    await conn.sendMessage(m.chat, { 
      text: `🎯 Ruleta activada por @${m.sender.split('@')[0]}...\nGirando la suerte...`,
      mentions: [m.sender] 
    }, { quoted: m });

    // Expulsar
    await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove');
    await conn.sendMessage(m.chat, { 
      text: `💀 El destino decidió... @${elegido.split('@')[0]} fue eliminado del grupo.`,
      mentions: [elegido] 
    }, { quoted: m });

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
