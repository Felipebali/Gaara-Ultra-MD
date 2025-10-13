// plugins/antilink.js
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp.com\/channel\/([0-9A-Za-z]+)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;
const allowedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i;

let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('⚠️ Solo en grupos');
    if (!isAdmin && !isOwner) return m.reply('⚠️ Solo admins pueden activar/desactivar');

    let chat = global.db.data.chats[m.chat] || {};
    chat.antiLink = !chat.antiLink; // Cambia el estado
    global.db.data.chats[m.chat] = chat;

    return m.reply(`🔗 AntiLink ahora está ${chat.antiLink ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`);
};

// Este before sigue igual, revisa mensajes y borra/expulsa si AntiLink está activo
handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
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

    if (!isAnyLink && !isGroupLink && !isChannelLink) return true;
    if (isAllowedLink) return true;

    try {
        await conn.sendMessage(m.chat, { delete: m.key });
        if (!isAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
            await conn.sendMessage(m.chat, { text: `> @${who.split("@")[0]} expulsado por enviar link prohibido.`, mentions: [who] });
        } else {
            await conn.sendMessage(m.chat, { text: `⚠️ @${who.split("@")[0]}, tu link fue eliminado.`, mentions: [who] });
        }
    } catch (e) {
        console.error('Error AntiLink:', e);
    }

    return true;
};

handler.help = ['antilink'];
handler.tags = ['group'];
handler.command = /^antilink$/i;
handler.group = true;

export default handler;
