/**
 * Anti-Link FelixCat-Bot
 * Admins: solo se borra el link
 * Usuarios normales: borra mensaje o expulsa según tipo de link
 * No elimina canales permitidos ni IG/TikTok/YouTube
 */

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i
const linkRegex = /\b((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\/?=&]*)?)\b/gi
const excepciones = ['instagram.com', 'youtu.be', 'youtube.com', 'tiktok.com']

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m || !m.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!isBotAdmin) return true

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.antiLink) return true

    const delet = m.key.participant
    const bang = m.key.id
    const name = m.pushName || m.name || m.notify || m.sender.split('@')[0]

    const isGroupLink = groupLinkRegex.test(m.text)
    const isChannelLink = channelLinkRegex.test(m.text)

    // Links HTTP/HTTPS generales
    const enlaces = m.text.match(linkRegex) || []
    const linkBloqueado = enlaces.some(link => {
        const linkLower = link.toLowerCase()
        return !excepciones.some(dom => linkLower.includes(dom))
    })

    // ⚡ Ignorar canales permitidos
    if (isChannelLink) return true

    // === CASO 1: admin ===
    if (isAdmin) {
        if (linkBloqueado || isGroupLink) {
            try {
                if (isBotAdmin) await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
                await conn.sendMessage(m.chat, {
                    text: `⚠️ El administrador *${name}* envió un enlace no permitido o de grupo. Solo se eliminó el mensaje.`,
                    mentions: [m.sender] // Mención real
                })
                console.log(`Mensaje de admin ${name} eliminado por Anti-Link`)
            } catch (e) { console.error(e) }
        }
        return true
    }

    // === CASO 2: usuario normal ===
    if (!isAdmin) {
        try {
            if (isBotAdmin) await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })

            if (isGroupLink) {
                // Expulsar si es link de grupo
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                await conn.sendMessage(m.chat, {
                    text: `🚫 El usuario *${name}* fue expulsado por enviar un link de grupo.`,
                    mentions: [m.sender] // Mención real
                })
                console.log(`Usuario ${name} expulsado por link de grupo`)
            } else if (linkBloqueado) {
                // Solo mensaje si es HTTP/HTTPS normal
                await conn.sendMessage(m.chat, {
                    text: `⚠️ ${name} envió un enlace no permitido. Solo se eliminó el mensaje.`,
                    mentions: [m.sender] // Mención real
                })
                console.log(`Mensaje de ${name} eliminado por link prohibido`)
            }

        } catch (e) { console.error(e) }

        return false
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
