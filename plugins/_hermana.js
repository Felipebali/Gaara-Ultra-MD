/**
 * Anti-Link FelixCat-Bot
 * Admins: solo se borra el link
 * Usuarios normales: se borra mensaje y se expulsa solo links de grupo
 * Incluye link de Tagall
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i
const tagallLink = 'https://miunicolink.local/tagall-FelixCat'

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!isBotAdmin) return true

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.antiLink) return true

    const isGroupLink = groupLinkRegex.test(m.text)
    const isChannelLink = channelLinkRegex.test(m.text)
    const isTagallLink = m.text.includes(tagallLink) // Detecta el link de tagall

    // Ignorar links de canales
    if (isChannelLink) return true

    const name = m.pushName || m.name || m.sender.split('@')[0]

    // === Admin ===
    if (isAdmin && (isGroupLink || isTagallLink)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key }) // borrar solo el mensaje
            await conn.sendMessage(m.chat, { 
                text: `✨ El admin *${name}* envió un link prohibido o de Tagall. Solo se eliminó el mensaje.`,
            })
            console.log(`Mensaje de admin ${name} eliminado por Anti-Link/Tagall`)
        } catch (err) {
            console.error("Error borrando mensaje de admin:", err)
        }
        return true
    }

    // === Usuario normal ===
    if (!isAdmin && (isGroupLink || isTagallLink)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key }) // borrar mensaje

            if (isGroupLink) {
                // Expulsar solo por link de grupo
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                await conn.sendMessage(m.chat, { 
                    text: `🚨 El usuario *${name}* fue expulsado por enviar link de grupo.`,
                })
                console.log(`Usuario ${name} eliminado del grupo por Anti-Link`)
            } else if (isTagallLink) {
                // Solo borrar mensaje si es link de tagall
                await conn.sendMessage(m.chat, { 
                    text: `⚡ ${name} envió un link de Tagall. Solo se eliminó el mensaje.`,
                })
                console.log(`Mensaje de ${name} eliminado por Tagall`)
            }

        } catch (err) {
            console.error("Error eliminando mensaje/usuario:", err)
        }
    }

    return true
}

// Comando para activar/desactivar Anti-Link (sin citar mensaje)
export async function antilinkCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return
    if (!isAdmin) return

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antiLink: true }
    let chat = global.db.data.chats[m.chat]
    chat.antiLink = !chat.antiLink

    await global.db.write()

    // Mensaje independiente, sin citar ni responder
    await conn.sendMessage(m.chat, { 
        text: `✅ Anti-Link ahora está ${chat.antiLink ? "activado" : "desactivado"} en este grupo.`,
    })
}
