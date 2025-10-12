/**
 * Anti-Link2 FelixCat-Bot - Borra IG, TikTok y YouTube con mención
 */

const linkRegex = /https?:\/\/[^\s]+/i // Detecta cualquier link
const blockedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i // Links a bloquear

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return true
    if (!isBotAdmin) return true

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.antiLink2) return true // Activado desde .antilink2

    const who = m.sender
    const name = await conn.getName(who)

    const isBlockedLink = blockedLinks.test(m.text)
    if (!isBlockedLink) return true // Si no es un link bloqueado, no hace nada

    try {
        // Borra el mensaje
        await conn.sendMessage(m.chat, { delete: m.key })

        // Mensaje según si es admin o no
        if (isAdmin) {
            await conn.sendMessage(m.chat, {
                text: `⚠️ @${who.split("@")[0]} (${name}), admin, nada de Instagram, TikTok ni YouTube aquí.`,
                mentions: [who]
            })
        } else {
            await conn.sendMessage(m.chat, {
                text: `⚠️ @${who.split("@")[0]} (${name}), ese link quedó borrado porque molesta.`,
                mentions: [who]
            })
        }

    } catch (e) {
        console.error('Error en Anti-Link2:', e)
    }

    return true
}

// Comando para activar/desactivar Anti-Link2
export async function antilink2Command(m, { conn, isAdmin }) {
    if (!m.isGroup) return
    if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.")

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]
    chat.antiLink2 = !chat.antiLink2

    await conn.sendMessage(m.chat, { 
        text: `✅ Anti-Link2 ahora está *${chat.antiLink2 ? "activado" : "desactivado"}*.`
    })
}
