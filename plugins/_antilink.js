/**
 * Anti-Link actualizado para FelixCat-Bot
 * Solo borra mensaje si es admin, expulsa usuarios normales
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

            // Lista de admins robusta
            const admins = groupMetadata.participants
                .filter(p => p.admin || p.isAdmin || p.admin === 'superadmin' || p.admin === 'admin')
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
