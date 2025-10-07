/**
 * Plugin Anti-Link para FelixCat-Bot
 * Detecta links de grupos de WhatsApp
 * Admins: solo se borra mensaje
 * Usuarios normales: se borra mensaje y se expulsa
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

export async function before(m, { conn }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antiLink: false }
    var chat = global.db.data.chats[m.chat]

    if (!chat.antiLink) return true

    if (groupLinkRegex.test(m.text)) {
        try {
            var groupMetadata = await conn.groupMetadata(m.chat)
            var senderId = m.sender.split('@')[0]

            // Obtener admins
            var admins = groupMetadata.participants
                .filter(function(p) { return p.admin === 'admin' || p.admin === 'superadmin' })
                .map(function(p) { return p.id.split('@')[0] })

            // Borrar siempre el mensaje
            await conn.sendMessage(m.chat, { delete: m.key })

            if (admins.indexOf(senderId) >= 0) {
                // Admin: solo aviso
                await conn.sendMessage(
                    m.chat,
                    { text: "⚠️ El administrador *" + senderId + "* envió un link de grupo.\n🔹 Las reglas son iguales para todos y el mensaje fue eliminado." }
                )
                console.log("Mensaje de admin " + senderId + " eliminado, reglas iguales para todos")
            } else {
                // Usuario normal: borrar y expulsar
                await conn.sendMessage(
                    m.chat,
                    { text: "> ⚠️ @" + senderId + " fue eliminado por enviar un link de grupo." },
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
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." })
    if (!isAdmin) return conn.sendMessage(m.chat, { text: "Solo administradores pueden activar/desactivar Anti-Link." })

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antiLink: true }
    var chat = global.db.data.chats[m.chat]
    chat.antiLink = !chat.antiLink

    await global.db.write()
    conn.sendMessage(m.chat, { text: "✅ Anti-Link ahora está " + (chat.antiLink ? "activado" : "desactivado") + " en este grupo." })
}
