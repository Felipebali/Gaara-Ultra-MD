/**
 * Plugin Anti-Link para FelixCat-Bot
 * Detecta links de grupos de WhatsApp y elimina mensajes de usuarios normales
 * No elimina ni expulsa a administradores
 */

const groupLinkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

export async function before(m, { conn }) {
    if (!m || !m.text) return
    if (m.isBaileys && m.fromMe) return !0
    if (!m.isGroup) return !1

    // Obtenemos la configuración del chat
    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat) {
        if (global.db?.data?.chats) global.db.data.chats[m.chat] = { antiLink: false }
        chat = global.db?.data?.chats?.[m.chat]
    }

    if (!chat.antiLink) return !0  // No está activado

    // Si hay link de grupo
    if (m.text.match(groupLinkRegex)) {
        try {
            // Obtener lista de admins del grupo
            const groupMetadata = await conn.groupMetadata(m.chat)
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)

            // Si el remitente NO es admin, eliminar mensaje
            if (!admins.includes(m.sender)) {
                await conn.sendMessage(m.chat, { delete: m.key }) // borrar mensaje
                await conn.reply(m.chat, `> ⚠️ @${m.sender.split`@`[0]} fue eliminado por Anti-Link`, null, { mentions: [m.sender] })
                console.log(`Usuario ${m.sender} eliminado del grupo ${m.chat} por Anti-Link`)
            } else {
                // Si es admin, solo avisamos y borramos el mensaje (sin expulsar)
                await conn.sendMessage(m.chat, { delete: m.key })
                await conn.reply(m.chat, `⚠️ Administrador @${m.sender.split`@`[0]} envió un link de grupo y fue eliminado solo el mensaje`, null, { mentions: [m.sender] })
                console.log(`Mensaje de admin ${m.sender} eliminado por Anti-Link`)
            }
        } catch (error) {
            console.error("Error procesando Anti-Link:", error)
        }
    }
    return !0
}

// Comando para activar/desactivar Anti-Link
export async function antilinkCommand(m, { conn, args, isAdmin }) {
    if (!m.isGroup) return conn.reply(m.chat, "Este comando solo funciona en grupos.", m)
    if (!isAdmin) return conn.reply(m.chat, "Solo administradores pueden activar/desactivar Anti-Link.", m)

    let chat = global.db.data.chats[m.chat]
    if (!chat) {
        global.db.data.chats[m.chat] = { antiLink: true }
        chat = global.db.data.chats[m.chat]
    } else {
        chat.antiLink = !chat.antiLink
    }

    await global.db.write()
    conn.reply(m.chat, `✅ Anti-Link ahora está ${chat.antiLink ? "activado" : "desactivado"} en este grupo.`, m)
}
