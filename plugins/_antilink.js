// plugins/antilink.js
/**
 * Anti-Link FelixCat-Bot - Funciona Independiente
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const anyLinkRegex = /https?:\/\/[^\s]+/i
const allowedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i
const tagallLink = 'https://miunicolink.local/tagall-FelixCat'

// Comando para activar/desactivar
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
    if (!m || !m.text) return true;
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return true;
    if (!isBotAdmin) return true;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antiLink) return true;

    const who = m.sender;
    const isGroupLink = groupLinkRegex.test(m.text);
    const isAnyLink = anyLinkRegex.test(m.text);
    const isAllowedLink = allowedLinks.test(m.text);
    const isTagallLink = m.text.includes(tagallLink);

    if (!isAnyLink && !isGroupLink && !isTagallLink) return true;
    if (isAllowedLink) return true;

    try {
        // Borra el mensaje
        await conn.sendMessage(m.chat, { delete: m.key });

        // Link de tagall -> mensaje especial
        if (isTagallLink) {
            await conn.sendMessage(m.chat, { 
                text: `Qué compartís el tagall inútil 😮‍💨 @${who.split("@")[0]}`,
                mentions: [who]
            });
            return true;
        }

        // Expulsión por link de grupo si no es admin
        if (!isAdmin && isGroupLink) {
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
            await conn.sendMessage(m.chat, { 
                text: `🚫 @${who.split("@")[0]} fue expulsado por enviar un link de grupo.`,
                mentions: [who]
            });
            return true;
        }

        // Cualquier otro link -> borra y menciona
        await conn.sendMessage(m.chat, { 
            text: `⚠️ @${who.split("@")[0]}, un link no permitido fue eliminado.`,
            mentions: [who]
        });

    } catch (e) {
        console.error('Error en Anti-Link:', e);
    }

    return true;
}
