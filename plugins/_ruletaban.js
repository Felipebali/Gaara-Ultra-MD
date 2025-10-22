// plugins/ruletabanF.js
// Activador: letra "F" o "f" (sin prefijo)
// Solo admin u owner puede usarlo
// Elimina a un usuario aleatorio (no admin, no owner, no bot)

module.exports = {
  name: 'ruletabanF',
  handler: async (m, { conn, participants, isAdmin, isOwner, groupMetadata }) => {
    try {
      if (!m.isGroup) return conn.reply(m.chat, '🔒 Este comando solo funciona en grupos.', m);

      // Solo admins o owners del bot pueden usarlo
      if (!isAdmin && !isOwner)
        return conn.reply(m.chat, '⚠️ Solo administradores del grupo o owners del bot pueden usar este comando.', m);

      const text = (m.text || '').trim();
      if (!(text === 'F' || text === 'f')) return; // activador

      // El bot debe ser admin para poder expulsar
      const botIsAdmin = participants.some(p => p.id === conn.user.jid && (p.admin === 'admin' || p.admin === 'superadmin'));
      if (!botIsAdmin)
        return conn.reply(m.chat, '❗ Necesito ser administrador del grupo para poder eliminar usuarios.', m);

      // Dueños del bot (añadí los tuyos acá)
      const BOT_OWNERS = ['59896026646', '59898719147']; // números sin @
      const ownersJids = BOT_OWNERS.map(n => n + '@s.whatsapp.net');

      // Filtrar usuarios elegibles
      const elegibles = participants.filter(p => {
        const jid = p.id;
        const isPartAdmin = !!p.admin;
        const isBot = jid === conn.user.jid;
        const isGroupOwner = groupMetadata.owner && jid === groupMetadata.owner;
        const isBotOwner = ownersJids.includes(jid);
        return !isPartAdmin && !isBot && !isGroupOwner && !isBotOwner;
      });

      if (!elegibles.length)
        return conn.reply(m.chat, '❌ No hay usuarios elegibles para expulsar (todos son admins o owners).', m);

      // Elegir al azar
      const elegido = elegibles[Math.floor(Math.random() * elegibles.length)].id;

      // Mensaje de inicio
      await conn.sendMessage(
        m.chat,
        { text: `🎯 Ruleta activada por @${m.sender.split('@')[0]}...\nGirando la suerte...`, mentions: [m.sender] },
        { quoted: m }
      );

      // Expulsar
      await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove');
      await conn.sendMessage(
        m.chat,
        { text: `💀 El destino decidió... @${elegido.split('@')[0]} fue eliminado del grupo.`, mentions: [elegido] },
        { quoted: m }
      );
    } catch (err) {
      console.error('Error en ruletabanF:', err);
      conn.reply(m.chat, `⚠️ Ocurrió un error: ${err.message}`, m);
    }
  },
  help: ['F (expulsa un usuario aleatorio)'],
  tags: ['admin'],
  command: ['F', 'f'],
  customPrefix: false,
  enabled: true
};
