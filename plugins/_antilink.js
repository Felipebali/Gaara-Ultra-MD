// plugins/_antilink.js
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;
const allowedLinks = /(tiktok\.com|youtube\.com|youtu\.be)/i;
const tagallLink = 'https://miunicolink.local/tagall-FelixCat';
const igLinkRegex = /(https?:\/\/)?(www\.)?instagram\.com\/[^\s]+/i; // ✅ IG

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m?.text) return true;
  if (!m.isGroup) return true;
  if (!isBotAdmin) return true;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antiLink) return true;

  const who = m.sender;
  const text = m.text;
  const isGroupLink = groupLinkRegex.test(text);
  const isChannelLink = channelLinkRegex.test(text);
  const isAnyLink = anyLinkRegex.test(text);
  const isAllowedLink = allowedLinks.test(text);
  const isTagall = text.includes(tagallLink);
  const isIG = igLinkRegex.test(text);

  if (!isAnyLink && !isGroupLink && !isChannelLink && !isTagall && !isIG) return true;
  if (isAllowedLink) return true; // se permiten yt/tiktok

  try {
    // ✅ Obtener link de invitación del grupo actual
    const currentInvite = await conn.groupInviteCode(m.chat);
    const currentGroupLink = `https://chat.whatsapp.com/${currentInvite}`;

    // ⚙️ Si es el link del mismo grupo
    if (isGroupLink && text.includes(currentInvite)) {
      await conn.sendMessage(m.chat, { react: { text: '💫', key: m.key } });
      await conn.sendMessage(m.chat, {
        text: `💫 @${who.split('@')[0]} compartió el link de *este mismo grupo*.\n¡Gracias por invitar más miembros! 🙌`,
        mentions: [who]
      });
      return true;
    }

    // ✅ No borrar mensaje si es canal o IG
    if (!isChannelLink && !isIG && !text.includes(currentInvite)) {
      await conn.sendMessage(m.chat, { delete: m.key });
    }

    // 🔹 Tagall
    if (isTagall) {
      await conn.sendMessage(m.chat, {
        text: `😮‍💨 Qué compartís el tagall inútil @${who.split('@')[0]}...`,
        mentions: [who],
      });
      return true;
    }

    // 🔹 Canal de WhatsApp
    if (isChannelLink) {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const allParticipants = groupMetadata.participants.map(p => p.id);
      const hiddenMentions = allParticipants.filter(id => id !== who);

      await conn.sendMessage(m.chat, { react: { text: '📢', key: m.key } });
      await conn.sendMessage(m.chat, {
        text: `📢 Atención equipo: @${who.split('@')[0]} compartió su canal 🔥\n¡Pasen a apoyarlo! 🙌`,
        mentions: [who, ...hiddenMentions],
      });
      return true;
    }

    // 🔹 Instagram
    if (isIG) {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const allParticipants = groupMetadata.participants.map(p => p.id);
      const hiddenMentions = allParticipants.filter(id => id !== who);

      await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } });
      await conn.sendMessage(m.chat, {
        text: `✨ @${who.split('@')[0]} compartió su Instagram.\n¡Dale follow y apoyá su perfil! ❤️`,
        mentions: [who, ...hiddenMentions],
      });
      return true;
    }

    // 🔹 Link de otro grupo (no coincide con el actual)
    if (isGroupLink && !text.includes(currentInvite)) {
      if (!isAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
        await conn.sendMessage(m.chat, {
          text: `🚫 @${who.split('@')[0]} fue *expulsado* por compartir un link de *otro grupo*.`,
          mentions: [who],
        });
      } else {
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${who.split('@')[0]}, no compartas links de otros grupos.`,
          mentions: [who],
        });
      }
      return true;
    }

    // 🔹 Otros links (no permitidos)
    await conn.sendMessage(m.chat, {
      text: `⚠️ @${who.split('@')[0]}, tu link fue eliminado (no permitido).`,
      mentions: [who],
    });

  } catch (e) {
    console.error('Error en Anti-Link:', e);
  }

  return true;
}
