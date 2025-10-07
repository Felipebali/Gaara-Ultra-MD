/**
 * Anti-Link unificado para FelixCat-Bot
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!isBotAdmin) return true

    let chatData = global.db?.data?.chats?.[m.chat]
    if (!chatData || !chatData.antiLink) return true

    const isGroupLink = groupLinkRegex.test(m.text)
    const isChannelLink = channelLinkRegex.test(m.text)

    // Ignorar links de canales
    if (isChannelLink) return true

    // Ignorar links del mismo grupo
    let linkThisGroup = ''
    try {
        linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (m.text.includes(linkThisGroup)) return true
    } catch (e) {
        console.error("[Anti-Link] No se pudo obtener código del grupo:", e)
    }

    const name = m.pushName || m.name || m.sender.split('@')[0]

    // Admin: solo borrar mensaje
    if (isAdmin && isGroupLink) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key })
            await conn.sendMessage(m.chat, { text: `⚠️ El administrador *${name}* envió un link de grupo. Solo se eliminó el mensaje, las reglas son iguales para todos.` })
            await conn.sendMessage(m.chat, { react: { text: '🐱', key: m.key } })
            console.log(`Mensaje de admin ${name} eliminado por Anti-Link`)
        } catch (err) {
            console.error("Error borrando mensaje de admin:", err)
        }
        return true
    }

    // Usuario normal: borrar mensaje y expulsar
    if (!isAdmin && isGroupLink) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key })
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            await conn.sendMessage(m.chat, { text: `> ⚠️ El usuario *${name}* fue expulsado por enviar un link de grupo. ¡No se permiten links de otros grupos!` })
            await conn.sendMessage(m.chat, { react: { text: '🐶', key: m.key } })
            console.log(`Usuario ${name} eliminado del grupo ${m.chat} por Anti-Link`)
        } catch (err) {
            console.error("Error eliminando usuario:", err)
        }
        return true
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
