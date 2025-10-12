// plugins/antilink.js
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp.com\/channel\/([0-9A-Za-z]+)/i;
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
    const isTagallLink = m.text.includes(tagallLink);

    if (!isAnyLink && !isGroupLink && !isChannelLink && !isTagallLink) return true;
    if (isAllowedLink) return true;

    try {
        // 🔹 Borrar mensaje correctamente
        if (m.key && m.key.id) {
            await conn.sendMessage(m.chat, {
                delete: { 
                    remoteJid: m.chat, 
                    fromMe: false, 
                    id: m.key.id, 
                    participant: m.key.participant || m.sender
                }
            });
        }

        // Link de tagall -> mensaje divertido
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

        // Expulsión por link de grupo o canal si no es admin
        if ((isGroupLink || isChannelLink) && !isAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
            await conn.sendMessage(m.chat, {
                text: `> ✦ Se ha eliminado a @${who.split("@")[0]} del grupo por \`Anti-Link\`! No permitimos enlaces de ${isChannelLink ? 'canales' : 'otros grupos'}.`,
                mentions: [who]
            });
            console.log(`Usuario ${who} eliminado del grupo ${m.chat}`);
            return true;
        }

        // Cualquier otro link -> advertencia
        await conn.sendMessage(m.chat, {
            text: `⚠️ @${who.split("@")[0]}, un link no permitido fue eliminado.`,
            mentions: [who]
        });

    } catch (e) {
        console.error('Error en Anti-Link:', e);
    }

    return true;
}
