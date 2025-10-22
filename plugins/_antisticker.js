// plugins/_antisticker.js
// .antisticker → activa o desactiva el sistema
// Si está activado, borra stickers y avisa al usuario

let handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return; // Solo en grupos

    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

    // --- Comando para activar/desactivar ---
    if (m.text && m.text.toLowerCase().startsWith('.antisticker')) {
      if (!isAdmin && !isOwner)
        return conn.reply(m.chat, '⚠️ Solo administradores o el dueño pueden usar este comando.', m);

      chat.antisticker = !chat.antisticker;
      return conn.reply(
        m.chat,
        chat.antisticker
          ? '✅ AntiSticker activado. Los stickers serán eliminados.'
          : '❌ AntiSticker desactivado.',
        m
      );
    }

    // --- Verificar si el sistema está activo y si es un sticker ---
    const isSticker =
      m.mtype === 'stickerMessage' ||
      m.message?.stickerMessage ||
      (m.msg && m.msg.mimetype === 'image/webp');

    if (chat.antisticker && isSticker) {
      const sender = m.sender.split('@')[0];

      // Verificar si el bot es admin
      const groupMetadata = await conn.groupMetadata(m.chat);
      const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const botInfo = groupMetadata.participants.find((p) => p.id === botNumber);
      const botIsAdmin = botInfo?.admin;

      if (!botIsAdmin) {
        return conn.reply(m.chat, '⚠️ No puedo borrar stickers porque no soy administrador.', m);
      }

      // --- Intentar borrar el sticker ---
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant || m.participant || m.key.remoteJid
          }
        });

        // Avisar al usuario
        await conn.sendMessage(m.chat, {
          text: `🚫 @${sender}, los stickers no están permitidos en este grupo.`,
          mentions: [m.sender]
        });
      } catch (e) {
        console.log('❌ Error al eliminar sticker:', e);
        await conn.sendMessage(m.chat, {
          text: `⚠️ No pude eliminar el sticker (ver consola).`,
          mentions: [m.sender]
        });
      }
    }
  } catch (err) {
    console.error('Error en antisticker:', err);
  }
};

handler.command = /^antisticker$/i;
handler.group = true;

export default handler;
