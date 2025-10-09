/**
 * Anti-Link FelixCat-Bot - Config Personalizada
 * ✅ Borra cualquier link
 * ✅ Expulsa solo si usuario común envía link de grupo
 * ❌ No expulsa por link de canal o páginas normales
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const anyLinkRegex = /https?:\/\/[^\s]+/i // Detecta cualquier link
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
    const isTagallLink = m.text.includes(tagallLink)

    // Si no hay link, no hace nada
    if (!isAnyLink && !isGroupLink && !isTagallLink) return true

    const name = m.pushName || m.sender.split('@')[0]

    try {
        // Borrar mensaje
        await conn.sendMessage(m.chat, { delete: m.key })

        // --- Admins ---
        if (isAdmin) {
            await conn.sendMessage(m.chat, { 
                text: `⚠️ ${name}, recordá que no se permiten links.`
            })
            return true
        }

        // --- Usuario común con link de grupo -> expulsar ---
        if (!isAdmin && isGroupLink) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            await conn.sendMessage(m.chat, { 
                text: `🚫 ${name} fue expulsado por enviar link de grupo.`
            })
            return true
        }

        // --- Cualquier otro link -> solo borrar ---
        await conn.sendMessage(m.chat, { 
            text: `⚠️ ${name}, no se permiten links aquí. Mensaje eliminado.`
        })

    } catch (e) {
        console.error('Error en Anti-Link:', e)
    }

    return true
}

// Comando toggle Anti-Link
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
