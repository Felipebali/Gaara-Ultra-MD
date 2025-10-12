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
    if (!isBotAdmin) return true;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antiLink) return true;

    const who = m.sender;
    const isGroupLink = groupLinkRegex.test(m.text);
    const isChannelLink = channelLinkRegex.test(m.text);
    const isAnyLink = anyLinkRegex.test(m.text);
    const isAllowedLink = allowedLinks.test(m.text);
    const isTagallLink = m.text.includes(tagallLink);

    if (!isAnyLink && !isGroupLink && !isChannelLink && !isTagallLink) return true;
    if (isAllowedLink) return true;

    try {
        // 🔹 Borrar mensaje correctamente usando protocolMessage
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

        // Tagall
        if (isTagallLink) {
            await conn.sendMessage(m.chat, {
                text: `Qué compartís el tagall inútil 😮‍💨 @${who.split("@")[0]}`,
                mentions: [who]
            });
            return true;
        }

        // Evitar expulsión si es link del mismo grupo
        if (isGroupLink) {
            try {
                const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
                if (m.text.includes(linkThisGroup)) return true;
            } catch (err) {
                console.error("[ERROR] No se pudo obtener el código del grupo:", err);
            }
        }

        // Expulsión si no es admin
        if ((isGroupLink || isChannelLink) && !isAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
            await conn.sendMessage(m.chat, {
                text: `> ✦ Se ha eliminado a @${who.split("@")[0]} del grupo por \`Anti-Link\`! No permitimos enlaces de ${isChannelLink ? 'canales' : 'otros grupos'}.`,
                mentions: [who]
            });
            console.log(`Usuario ${who} eliminado del grupo ${m.chat}`);
            return true;
        }

        // Otro link -> advertencia
        await conn.sendMessage(m.chat, {
            text: `⚠️ @${who.split("@")[0]}, un link no permitido fue eliminado.`,
            mentions: [who]
        });

    } catch (e) {
        console.error('Error en Anti-Link:', e);
    }

    return true;
}
