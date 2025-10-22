// plugins/_antisticker.js
// Versión universal — elimina stickers detectados de cualquier forma
let handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return;

    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

    // Activar/desactivar
    if (m.text && m.text.toLowerCase().startsWith('.antisticker')) {
      if (!isAdmin && !isOwner)
        return conn.reply(m.chat, '⚠️ Solo administradores o el dueño pueden usar este comando.', m);
      chat.antisticker = !chat.antisticker;
      return conn.reply(m.chat, `${chat.antisticker ? '✅ AntiSticker activado.' : '❌ AntiSticker desactivado.'}`, m);
    }

    // Detectar stickers de forma universal
    const msgType = m.mtype || Object.keys(m.message || {})[0] || '';
    const isSticker =
      msgType.includes('sticker') ||
      (m.message?.stickerMessage) ||
      (m.msg?.mimetype === 'image/webp') ||
      (m.message?.imageMessage?.mimetype === 'image/webp');

    if (chat.antisticker && isSticker) {
      const sender = m.sender.split('@')[0];

      // Verificar si el bot es admin
      const groupMetadata = await conn.groupMetadata(m.chat);
      const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const botData = groupMetadata.participants.find((p) => p.id === botId);
      const botIsAdmin = botData?.admin;

      if (!botIsAdmin)
        return conn.reply(m.chat, '⚠️ No puedo borrar stickers porque no soy administrador.', m);

      // Intentar eliminar
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant || m.participant || m.key.remoteJid,
          },
        });

        await conn.sendMessage(m.chat, {
          text: `🚫 @${sender}, los stickers no están permitidos en este grupo.`,
          mentions: [m.sender],
        });
      } catch (e) {
        console.log('Error al eliminar sticker:', e);
      }
    }
  } catch (err) {
    console.error('Error en antisticker:', err);
  }
};

handler.command = /^antisticker$/i;
handler.group = true;

export default handler;
