const groupLinkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

export async function before(m, { conn }) {
    if (!m?.text) return
    if (m.isBaileys && m.fromMe) return !0
    if (!m.isGroup) return !1

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat) {
        if (!global.db.data.chats) global.db.data.chats = {}
        global.db.data.chats[m.chat] = { antiLink: false }
        chat = global.db.data.chats[m.chat]
    }
    if (!chat.antiLink) return !0

    if (m.text.match(groupLinkRegex)) {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)

            // Normalizamos IDs y obtenemos nombres
            const senderId = m.sender.split('@')[0]
            const senderParticipant = groupMetadata.participants.find(p => p.id.split('@')[0] === senderId)
            const senderName = senderParticipant?.name || senderId

            const admins = groupMetadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id.split('@')[0])

            // Borrar mensaje siempre
            await conn.sendMessage(m.chat, { delete: m.key })

            if (admins.includes(senderId)) {
                // Admin: solo aviso con nombre
                await conn.reply(
                    m.chat,
                    `⚠️ El administrador *${senderName}* envió un link de grupo.\n🔹 Las reglas son iguales para todos y el mensaje fue eliminado.`,
                    null,
                    { mentions: [m.sender] }
                )
                console.log(`Mensaje de admin ${senderName} eliminado, reglas iguales para todos`)
            } else {
                // Usuario normal: borrar y expulsar
                await conn.reply(
                    m.chat,
                    `> ⚠️ @${senderId} fue eliminado por enviar un link de grupo.`,
                    null,
                    { mentions: [m.sender] }
                )
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                console.log(`Usuario ${senderId} eliminado del grupo ${m.chat} por Anti-Link`)
            }
        } catch (error) {
            console.error("Error procesando Anti-Link:", error)
        }
    }
    return !0
}
