// plugins/_antisticker.js
// .antisticker → activa o desactiva el sistema
// Si está activado, borra stickers y avisa al usuario

let handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return; // Solo en grupos

    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

    // Comando para activar/desactivar
    if (m.text && m.text.toLowerCase().startsWith('.antisticker')) {
      if (!isAdmin && !isOwner)
        return conn.reply(m.chat, '⚠️ Solo administradores o el dueño pueden usar este comando.', m);
      chat.antisticker = !chat.antisticker;
      return conn.reply(m.chat, `${chat.antisticker ? '✅ AntiSticker activado.' : '❌ AntiSticker desactivado.'}`, m);
    }

    // Si está activado y es un sticker
    if (chat.antisticker && (m.mtype === 'sticker' || m.message?.stickerMessage)) {
      const sender = m.sender.split('@')[0];

      // Intentar borrar el mensaje (requiere que el bot sea admin)
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
          }
        });
      } catch (e) {
        // Si falla, solo avisa
        console.log('Error al eliminar sticker:', e);
      }

      // Avisar al usuario
      await conn.sendMessage(m.chat, {
        text: `🚫 @${sender}, los stickers no están permitidos en este grupo.`,
        mentions: [m.sender]
      });
    }
  } catch (err) {
    console.error('Error en antisticker:', err);
  }
};

handler.command = /^antisticker$/i;
handler.group = true;

module.exports = handler;
