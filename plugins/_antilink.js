const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;

// Enlaces permitidos (no se borran ni sancionan)
const allowedLinks = /(tiktok\.com|youtube\.com|youtu\.be|link\.clashroyale\.com)/i;

const tagallLink = 'https://miunicolink.local/tagall-FelixCat';
const igLinkRegex = /(https?:\/\/)?(www\.)?instagram\.com\/[^\s]+/i;
const clashLinkRegex = /(https?:\/\/)?(link\.clashroyale\.com)\/[^\s]+/i;

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m?.text) return true;
  if (!m.isGroup) return true;
  if (!isBotAdmin) return true;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antiLink) return true;

  const text = m.text;

  const isGroupLink = groupLinkRegex.test(text);
  const isChannelLink = channelLinkRegex.test(text);
  const isAnyLink = anyLinkRegex.test(text);
  const isAllowedLink = allowedLinks.test(text);
  const isTagall = text.includes(tagallLink);
  const isIG = igLinkRegex.test(text);
  const isClash = clashLinkRegex.test(text);

  // 🔹 Links permitidos totalmente: IG, canales, Clash, allowedLinks
  if (isIG || isChannelLink || isClash || isAllowedLink) return true;

  // 🔹 Tagall no permitido
  if (isTagall) {
    const who = m.sender;
    await conn.sendMessage(m.chat, {
      text: `😮‍💨 Qué compartís el tagall inútil @${who.split('@')[0]}...`,
      mentions: [who],
    });
    return true;
  }

  // 🔹 Link del mismo grupo permitido
  const currentInvite = await conn.groupInviteCode(m.chat);
  if (isGroupLink && text.includes(currentInvite)) return true;

  // 🔹 Link de otro grupo
  if (isGroupLink && !text.includes(currentInvite)) {
    const who = m.sender;
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

  // 🔹 Otros links no permitidos
  if (isAnyLink) {
    const who = m.sender;
    await conn.sendMessage(m.chat, {
      text: `⚠️ @${who.split('@')[0]}, tu link fue eliminado (no permitido).`,
      mentions: [who],
    });
  }

  return true;
}
