// --- Handler combinado AFK ---
let afkHandler = async (m, { conn, args }) => {
    // Asegurarse que exista la info del usuario
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    let user = global.db.data.users[m.sender]

    // Activar AFK si se usa el comando .afk
    if (m.text && m.text.startsWith('.afk')) {
        let text = args.join(' ') || (m.quoted && m.quoted.text) || 'Sin motivo'
        user.afk = Date.now()
        user.afkReason = text

        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
@${m.sender.split('@')[0]} está ahora AFK
Motivo: ${text}`,
            m,
            { mentions: [m.sender] }
        )
        return true
    }

    // --- Handler before: desactivar AFK al escribir ---
    if (user.afk > -1) {
        let who = m.sender
        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
@${who.split("@")[0]}, ya no estás AFK.
Motivo anterior: ${user.afkReason || 'Sin motivo'}
Tiempo AFK: ${Math.floor((Date.now() - user.afk)/1000)} segundos`,
            m,
            { mentions: [who] }
        )
        user.afk = -1
        user.afkReason = ''
    }

    // Avisar si mencionan a alguien AFK
    let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    for (let jid of jids) {
        if (!global.db.data.users[jid]) global.db.data.users[jid] = {}
        let afkUser = global.db.data.users[jid]
        if (!afkUser.afk || afkUser.afk < 0) continue

        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
@${jid.split("@")[0]} está AFK.
Motivo: ${afkUser.afkReason || 'Sin motivo'}
Tiempo AFK: ${Math.floor((Date.now() - afkUser.afk)/1000)} segundos`,
            m,
            { mentions: [jid] }
        )
    }

    return true
}

afkHandler.command = /^afk$/i
afkHandler.register = true
afkHandler.before = true

export default afkHandler
