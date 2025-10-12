/**
 * Anti-Link FelixCat-Bot - Config Personalizada con Mención
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const anyLinkRegex = /https?:\/\/[^\s]+/i // Detecta cualquier link
const allowedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i // Links permitidos
const tagallLink = 'https://miunicolink.local/tagall-FelixCat'

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!isBotAdmin) return true

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.antiLink) return true

    const isGroupLink = groupLinkRegex.test(m.text)
    const isAnyLink = anyLinkRegex.test(m.text)
    const isAllowedLink = allowedLinks.test(m.text)
    const isTagallLink = m.text.includes(tagallLink)
    const who = m.sender // Aquí guardamos quién envió el mensaje

    // No hay link -> no hace nada
    if (!isAnyLink && !isGroupLink && !isTagallLink) return true

    // Permitir links de Instagram / TikTok / YouTube
    if (isAllowedLink) return true

    try {
        // Borra el mensaje
        await conn.sendMessage(m.chat, { delete: m.key })

        // Link de tagall -> mensaje especial
        if (isTagallLink) {
            await conn.sendMessage(m.chat, { 
                text: `Qué compartís el tagall inútil 😮‍💨 @${who.split("@")[0]}`,
                mentions: [who] // Esto hace que mencione al usuario
            })
            return true
        }

        // Expulsión por link de grupo si no es admin
        if (!isAdmin && isGroupLink) {
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
            await conn.sendMessage(m.chat, { 
                text: `🚫 @${who.split("@")[0]} fue expulsado por enviar un link de grupo.`,
                mentions: [who]
            })
            return true
        }

        // Cualquier otro link se borra y envía aviso mencionando al usuario
        await conn.sendMessage(m.chat, { 
            text: `⚠️ @${who.split("@")[0]}, un link no permitido fue eliminado.`,
            mentions: [who]
        })

    } catch (e) {
        console.error('Error en Anti-Link:', e)
    }

    return true
}
