// plugins/antilink.js
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp.com\/channel\/([0-9A-Za-z]+)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;
const allowedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i;
const tagallLink = 'https://miunicolink.local/tagall-FelixCat';

let handler = async (m, { conn, isAdmin, isOwner, args }) => {
    // ✅ Toggle si se usa el comando
    if (m.text === '.antilink') {
        if (!m.isGroup) return m.reply('⚠️ Solo en grupos');
        if (!isAdmin && !isOwner) return m.reply('⚠️ Solo admins pueden activar/desactivar');

        let chat = global.db.data.chats[m.chat] || {};
        chat.antiLink = !chat.antiLink;
        global.db.data.chats[m.chat] = chat;

        return m.reply(`🔗 AntiLink ahora está ${chat.antiLink ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`);
    }
};

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
    // ❌ Salir si no es grupo o bot no es admin
    if (!m?.text) return true;
    if (!m.isGroup) return true;
    if (!isBotAdmin) return true;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antiLink) return true; // Si está desactivado, no hacer nada

    const who = m.sender;
    const isGroupLink = groupLinkRegex.test(m.text);
    const isChannelLink = channelLinkRegex.test(m.text);
    const isAnyLink = anyLinkRegex.test(m.text);
    const isAllowedLink = allowedLinks.test(m.text);
    const isTagall = m.text.includes(tagallLink);

    if (!isAnyLink && !isGroupLink && !isChannelLink && !isTagall) return true;
    if (isAllowedLink) return true;

    try {
        // 🔹 BORRAR MENSAJE
        await conn.sendMessage(m.chat, { delete: m.key });

        // 🔹 Tagall: solo borrar y advertir
        if (isTagall) {
            await conn.sendMessage(m.chat, {
                text: `Qué compartís el tagall inútil 😮‍💨 @${who.split("@")[0]}`,
                mentions: [who]
            });
            return true;
        }

        // 🔹 Links de grupos o canales
        if (isGroupLink || isChannelLink) {
            if (!isAdmin) {
                await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
                await conn.sendMessage(m.chat, {
                    text: `> ✦ @${who.split("@")[0]} fue expulsado por enviar un link de ${isChannelLink ? 'canal' : 'otro grupo'}.`,
                    mentions: [who]
                });
            } else {
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

handler.help = ['antilink'];
handler.tags = ['group'];
handler.command = /^antilink$/i;
handler.group = true;

export default handler;
