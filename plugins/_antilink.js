const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i
// Regex seguro que detecta cualquier link http/https
const linkRegex = /https?:\/\/[^\s]+/gi
const excepciones = ['instagram.com', 'youtu.be', 'youtube.com', 'tiktok.com']

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!isBotAdmin) return true

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.antiLink) return true

    const delet = m.key.participant
    const bang = m.key.id
    const name = m.pushName || m.name || m.notify || m.sender.split('@')[0]

    const isGroupLink = groupLinkRegex.test(m.text)
    const isChannelLink = channelLinkRegex.test(m.text)

    // Detectar links reales
    const enlaces = m.text.match(linkRegex) || []
    if (enlaces.length === 0) return true // Si no hay links, no hacer nada

    // Revisar si hay links prohibidos
    const linkBloqueado = enlaces.some(link => {
        const linkLower = link.toLowerCase()
        return !excepciones.some(dom => linkLower.includes(dom))
    })

    // Ignorar links de canales permitidos
    if (isChannelLink) return true

    // === Admin ===
    if (isAdmin) {
        if (linkBloqueado || isGroupLink) {
            try {
                if (isBotAdmin) await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
                await conn.sendMessage(m.chat, {
                    text: `⚠️ El admin *${name}* envió un link prohibido o de grupo. Solo se eliminó el mensaje.`,
                    mentions: [m.sender]
                })
            } catch (e) { console.error(e) }
        }
        return true
    }

    // === Usuario normal ===
    if (!isAdmin) {
        try {
            if (isBotAdmin) await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })

            if (isGroupLink) {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                await conn.sendMessage(m.chat, {
                    text: `🚫 El usuario *${name}* fue expulsado por enviar link de grupo.`,
                    mentions: [m.sender]
                })
            } else if (linkBloqueado) {
                await conn.sendMessage(m.chat, {
                    text: `⚠️ ${name} envió un enlace no permitido. Solo se eliminó el mensaje.`,
                    mentions: [m.sender]
                })
            }

        } catch (e) { console.error(e) }

        return false
    }

    return true
}
