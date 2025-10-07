/**
 * Plugin Anti-Link para FelixCat-Bot
 * Detecta links de grupos de WhatsApp y elimina mensajes de usuarios normales
 * No elimina ni expulsa a administradores
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

export async function before(m, { conn }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antiLink: false }
    let chat = global.db.data.chats[m.chat]

    if (!chat.antiLink) return true

    if (m.text.match(groupLinkRegex)) {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const senderId = m.sender.split('@')[0]

            // Obtener nombre del remitente
            let senderName = senderId
            const participant = groupMetadata.participants.find(function(p) {
                return p.id.split('@')[0] === senderId
            })
            if (participant && participant.name) senderName = participant.name

            // Obtener admins
            const admins = groupMetadata.participants
                .filter(function(p) { return p.admin === 'admin' || p.admin === 'superadmin' })
                .map(function(p) { return p.id.split('@')[0] })

            // Borrar siempre el mensaje
            await conn.sendMessage(m.chat, { delete: m.key })

            if (admins.indexOf(senderId) >= 0) {
                // Admin: solo aviso
                await conn.reply(
                    m.chat,
                    "⚠️ El administrador *" + senderName + "* envió un link de grupo.\n🔹 Las reglas son iguales para todos y el mensaje fue eliminado.",
                    null,
                    { mentions: [m.sender] }
                )
                console.log("Mensaje de admin " + senderName + " eliminado, reglas iguales para todos")
            } else {
                // Usuario normal: borrar y expulsar
                await conn.reply(
                    m.chat,
                    "> ⚠️ @" + senderId + " fue eliminado por enviar un link de grupo.",
                    null,
                    { mentions: [m.sender] }
                )
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                console.log("Usuario " + senderId + " eliminado del grupo " + m.chat + " por Anti-Link")
            }

        } catch (error) {
            console.error("Error procesando Anti-Link:", error)
        }
    }

    return true
}

// Comando para activar/desactivar Anti-Link
export async function antilinkCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return conn.reply(m.chat, "Este comando solo funciona en grupos.", m)
    if (!isAdmin) return conn.reply(m.chat, "Solo administradores pueden activar/desactivar Anti-Link.", m)

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antiLink: true }
    let chat = global.db.data.chats[m.chat]
    chat.antiLink = !chat.antiLink

    await global.db.write()
    conn.reply(m.chat, "✅ Anti-Link ahora está " + (chat.antiLink ? "activado" : "desactivado") + " en este grupo.", m)
}
