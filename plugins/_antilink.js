/**
 * Plugin Anti-Link para FelixCat-Bot
 * Detecta links de grupos de WhatsApp
 * Admins: solo se borra el mensaje y se avisa que las reglas son iguales
 * Usuarios normales: mensaje borrado y expulsión
 */

const groupLinkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

export async function before(m, { conn }) {
    if (!m?.text) return
    if (m.isBaileys && m.fromMe) return !0
    if (!m.isGroup) return !1

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat) {
        if (global.db?.data?.chats) global.db.data.chats[m.chat] = { antiLink: false }
        chat = global.db?.data?.chats[m.chat]
    }
    if (!chat.antiLink) return !0

    if (m.text.match(groupLinkRegex)) {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)

            // Todos los admins: admin o superadmin
            const admins = groupMetadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id)

            // Borrar mensaje siempre
            await conn.sendMessage(m.chat, { delete: m.key })

            if (admins.includes(m.sender)) {
                // Admin: solo aviso
                await conn.reply(
                    m.chat,
                    `⚠️ Administrador @${m.sender.split`@`[0]} envió un link de grupo.\n🔹 Las reglas son iguales para todos y el mensaje fue eliminado.`,
                    null,
                    { mentions: [m.sender] }
                )
                console.log(`Mensaje de admin ${m.sender} eliminado, reglas iguales para todos`)
            } else {
                // Usuario normal: borrar y expulsar
                await conn.reply(
                    m.chat,
                    `> ⚠️ @${m.sender.split`@`[0]} fue eliminado por enviar un link de grupo.`,
                    null,
                    { mentions: [m.sender] }
                )
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                console.log(`Usuario ${m.sender} eliminado del grupo ${m.chat} por Anti-Link`)
            }
        } catch (error) {
            console.error("Error procesando Anti-Link:", error)
        }
    }
    return !0
}

// Comando para activar/desactivar Anti-Link
export async function antilinkCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return conn.reply(m.chat, "Este comando solo funciona en grupos.", m)
    if (!isAdmin) return conn.reply(m.chat, "Solo administradores pueden activar/desactivar Anti-Link.", m)

    let chat = global.db.data.chats[m.chat] || { antiLink: true }
    chat.antiLink = !chat.antiLink
    global.db.data.chats[m.chat] = chat
    await global.db.write()
    conn.reply(m.chat, `✅ Anti-Link ahora está ${chat.antiLink ? "activado" : "desactivado"} en este grupo.`, m)
}
