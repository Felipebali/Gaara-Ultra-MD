// plugins/_antilink.js
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;
const allowedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i;
const tagallLink = 'https://miunicolink.local/tagall-FelixCat';

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

if (!isAnyLink && !isGroupLink && !isChannelLink && !isTagall) return true;
if (isAllowedLink) return true;

try {
// 🔹 BORRAR MENSAJE SIEMPRE
await conn.sendMessage(m.chat, { delete: m.key });

// 🔹 Tagall: solo borrar    
if (isTagall) {    
    await conn.sendMessage(m.chat, {    
        text: `Qué compartís el tagall inútil 😮‍💨 @${who.split("@")[0]}`,    
        mentions: [who]    
    });    
    return true;    
}    

// 🔹 Links de otros grupos o canales    
if (isGroupLink || isChannelLink) {    
    if (!isAdmin) {    
        // Usuario normal -> expulsar + mensaje    
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove');    
        await conn.sendMessage(m.chat, {    
            text: `> ✦ @${who.split("@")[0]} fue expulsado por enviar un link de ${isChannelLink ? 'canal' : 'otro grupo'}.`,    
            mentions: [who]    
        });    
    } else {    
        // Admin -> solo mensaje    
        await conn.sendMessage(m.chat, {    
            text: `⚠️ @${who.split("@")[0]}, tu link de ${isChannelLink ? 'canal' : 'otro grupo'} fue eliminado.`,    
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
