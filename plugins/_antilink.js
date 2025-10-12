// plugins/_antilink.js
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp.com\/channel\/([0-9A-Za-z]+)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;
const allowedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i;
const tagallLink = 'https://miunicolink.local/tagall-FelixCat';

// Comando para activar/desactivar Anti-Link
let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner)
        return conn.sendMessage(m.chat, { text: '🚫 Solo administradores o el dueño pueden usar este comando.' });

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    chat.antiLink = !chat.antiLink;
    const estado = chat.antiLink ? '✅ activado' : '🛑 desactivado';
    return conn.sendMessage(m.chat, { text: `🔗 Anti-Link ${estado}` });
};

handler.command = ['antilink'];
handler.group = true;
export default handler;

// Plugin que bloquea links
export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m?.text) return true;
    if (!m.isGroup) return true;
    if (!isBotAdmin) return true; // el bot debe ser admin para borrar

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
        // 🔹 BORRAR MENSAJE siempre que sea link
        if (m.key && m.key.id) {
            await conn.sendMessage(m.chat, {
                protocolMessage: {
                    key: { 
                        id: m.key.id, 
                        remoteJid: m.chat, 
                        fromMe: false, 
                        participant: m.key.participant || m.sender 
                    },
                    type: 0
                }
            });
        }

        // 🔹 Tagall: siempre borra, no expulsa
        if (isTagall) {
            await conn.sendMessage(m.chat, {
                text: `Qué compartís el tagall inútil 😮‍💨 @${who.split("@")[0]}`,
                mentions: [who]
            });
            return true;
        }

        // 🔹 Links de otros grupos o canales
        if ((isGroupLink || isChannelLink)) {
            if (!isAdmin) {
                // Usuario normal -> borra + expulsa
                await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
                await conn.sendMessage(m.chat, {
                    text: `> ✦ @${who.split("@")[0]} fue expulsado por enviar un link de ${isChannelLink ? 'canal' : 'otro grupo'}.`,
                    mentions: [who]
                });
                console.log(`Usuario ${who} eliminado del grupo ${m.chat}`);
            } else {
                // Admin -> solo borra
                await conn.sendMessage(m.chat, {
                    text: `⚠️ @${who.split("@")[0]}, tu link de ${isChannelLink ? 'canal' : 'otro grupo'} fue eliminado.`,
                    mentions: [who]
                });
            }
            return true;
        }

        // 🔹 Otros links -> mensaje de advertencia
        await conn.sendMessage(m.chat, {
            text: `⚠️ @${who.split("@")[0]}, un link no permitido fue eliminado.`,
            mentions: [who]
        });

    } catch (e) {
        console.error('Error en Anti-Link:', e);
    }

    return true;
}
