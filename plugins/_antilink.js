/**
 * Anti-Link FelixCat-Bot - Config Personalizada
 * ✅ Borra cualquier link
 * ✅ Expulsa solo si usuario común envía link de grupo
 * ✅ PERMITE Instagram, TikTok y YouTube
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const anyLinkRegex = /https?:\/\/[^\s]+/i // Detecta cualquier link
const allowedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i // ✅ Links permitidos
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

    // ⛔ No hay link -> no hace nada
    if (!isAnyLink && !isGroupLink && !isTagallLink) return true

    // ✅ Permitir links de Instagram / TikTok / YouTube
    if (isAllowedLink) return true

    const name = m.pushName || m.sender.split('@')[0]

    try {
        // 🗑️ Borra mensaje
        await conn.sendMessage(m.chat, { delete: m.key })

        // 👑 Admins -> solo advertencia
        if (isAdmin) {
            await conn.sendMessage(m.chat, { 
                text: `⚠️ ${name}, recordá que no se permiten links aquí.`
            })
            return true
        }

        // 🚫 Expulsión por link de grupo
        if (!isAdmin && isGroupLink) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            await conn.sendMessage(m.chat, { 
                text: `🚫 ${name} fue expulsado por enviar link de grupo.`
            })
            return true
        }

        // ❗ Cualquier otro link se borra
        await conn.sendMessage(m.chat, { 
            text: `⚠️ ${name}, no se permiten links aquí. Mensaje eliminado.`
        })

    } catch (e) {
        console.error('Error en Anti-Link:', e)
    }

    return true
}

// ✅ Comando para activar/desactivar Anti-Link
export async function antilinkCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return
    if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.")

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]
    chat.antiLink = !chat.antiLink

    await conn.sendMessage(m.chat, { 
        text: `✅ Anti-Link ahora está *${chat.antiLink ? "activado" : "desactivado"}*.`
    })
}
