// plugins/_antilink.js
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;
const allowedLinks = /(tiktok\.com|youtube\.com|youtu\.be)/i; // IG lo vamos a manejar aparte
const tagallLink = 'https://miunicolink.local/tagall-FelixCat';
const igLinkRegex = /(https?:\/\/)?(www\.)?instagram\.com\/[^\s]+/i; // ✅ IG

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m?.text) return true;
  if (!m.isGroup) return true;
  if (!isBotAdmin) return true;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antiLink) return true;

  const who = m.sender;
  const isGroupLink = groupLinkRegex.test(m.text);
  const isChannelLink = channelLinkRegex.test(m.text);
  const isAnyLink = anyLinkRegex.test(m.text);
  const isAllowedLink = allowedLinks.test(m.text);
  const isTagall = m.text.includes(tagallLink);
  const isIG = igLinkRegex.test(m.text); // ✅ IG

  // Si no hay links, no hacer nada
  if (!isAnyLink && !isGroupLink && !isChannelLink && !isTagall && !isIG) return true;

  // Links permitidos como youtube, tiktok, etc
  if (isAllowedLink) return true;

  try {
    // ✅ NO borrar mensaje si es canal o IG
    if (!isChannelLink && !isIG) {
      await conn.sendMessage(m.chat, { delete: m.key });
    }

    // 🔹 Tagall: solo borrar y responder
    if (isTagall) {
      await conn.sendMessage(m.chat, {
        text: `Qué compartís el tagall inútil 😮‍💨 @${who.split("@")[0]}`,
        mentions: [who]
      });
      return true;
    }

    // ✅ LINKS DE CANALES DE WHATSAPP
    if (isChannelLink) {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const allParticipants = groupMetadata.participants.map(p => p.id);
      const hiddenMentions = allParticipants.filter(id => id !== who);

      await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } });
      await conn.sendMessage(m.chat, {
        text: `📢 Atención equipo: @${who.split("@")[0]} dejó su canal. Contenido de nivel, recomendadísimo ✅🔥`,
        mentions: [who, ...hiddenMentions]
      });
      return true;
    }

    // 🔹 LINKS DE INSTAGRAM
    if (isIG) {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const allParticipants = groupMetadata.participants.map(p => p.id);
      const hiddenMentions = allParticipants.filter(id => id !== who);

      // Reaccionar al IG
      await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } });

      // Mensaje de promoción con mención pública y oculta
      await conn.sendMessage(m.chat, {
        text: `📢 Atención equipo: @${who.split("@")[0]} compartió su Instagram. ¡Dale follow y apoyemos su perfil! ✨`,
        mentions: [who, ...hiddenMentions]
      });
      return true;
    }

    // 🔹 Links de otros grupos -> borrar + expulsar
    if (isGroupLink) {
      if (!isAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
        await conn.sendMessage(m.chat, {
          text: `> ✦ @${who.split("@")[0]} fue expulsado por enviar un link de *otro grupo*.`,
          mentions: [who]
        });
      } else {
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${who.split("@")[0]}, tu link de *otro grupo* fue eliminado.`,
          mentions: [who]
        });
      }
      return true;
    }

    // 🔹 Otros links -> advertencia
    await conn.sendMessage(m.chat, {
      text: `⚠️ @${who.split("@")[0]}, un link no permitido fue eliminado.`,
      mentions: [who]
    });

  } catch (e) {
    console.error('Error en Anti-Link:', e);
  }

  return true;
};
