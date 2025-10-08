/**
 * Anti-Link FelixCat-Bot
 * Admins: solo se borra el link
 * Usuarios normales: se borra mensaje y se expulsa
 * No elimina canales
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!isBotAdmin) return true

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.antiLink) return true

    const isGroupLink = groupLinkRegex.test(m.text)
    const isChannelLink = channelLinkRegex.test(m.text)

    // Ignorar links de canales
    if (isChannelLink) return true

    // Si es admin
    if (isAdmin && isGroupLink) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key }) // borrar solo el link
            const name = m.pushName || m.name || m.sender.split('@')[0]
            await conn.sendMessage(m.chat, { text: `⚠️ El administrador *${name}* envió un link de grupo. Solo se eliminó el mensaje, las reglas son iguales para todos.` })
            console.log(`Mensaje de admin ${name} eliminado por Anti-Link`)
        } catch (err) {
            console.error("Error borrando mensaje de admin:", err)
        }
        return true
    }

    // Si es usuario normal
    if (!isAdmin && isGroupLink) {
        try {
            const name = m.pushName || m.name || m.sender.split('@')[0]
            await conn.sendMessage(m.chat, { delete: m.key }) // borrar mensaje
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove') // expulsar
            await conn.sendMessage(m.chat, { text: `> ⚠️ El usuario *${name}* fue expulsado por enviar un link de grupo.` })
            console.log(`Usuario ${name} eliminado del grupo ${m.chat} por Anti-Link`)
        } catch (err) {
            console.error("Error eliminando usuario:", err)
        }
    }

    return true
}

// Comando para activar/desactivar Anti-Link
export async function antilinkCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." })
    if (!isAdmin) return conn.sendMessage(m.chat, { text: "Solo administradores pueden activar/desactivar Anti-Link." })

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antiLink: true }
    let chat = global.db.data.chats[m.chat]
    chat.antiLink = !chat.antiLink

    await global.db.write()
    conn.sendMessage(m.chat, { text: `✅ Anti-Link ahora está ${chat.antiLink ? "activado" : "desactivado"} en este grupo.` })
}
