let afkHandler = async (m, { conn, args }) => {
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    let user = global.db.data.users[m.sender]

    const formatAFK = (ms) => {
        let total = Math.floor(ms / 1000)
        let h = Math.floor(total / 3600)
        let m = Math.floor((total % 3600) / 60)
        let s = total % 60
        return `${h}h ${m}m ${s}s`
    }

    // --- Activar AFK si es el comando ---
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
        return true // no hacer nada más en este mensaje
    }

    // --- Desactivar AFK si el usuario envía mensaje ---
    if (user.afk > -1) {
        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
@${m.sender.split("@")[0]} ya no estás AFK
Motivo anterior: ${user.afkReason || 'Sin motivo'}
Tiempo AFK: ${formatAFK(Date.now() - user.afk)}`,
            m,
            { mentions: [m.sender] }
        )
        user.afk = -1
        user.afkReason = ''
    }

    // --- Avisar si mencionan a alguien AFK ---
    let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    for (let jid of jids) {
        if (!global.db.data.users[jid]) global.db.data.users[jid] = {}
        let afkUser = global.db.data.users[jid]
        if (!afkUser.afk || afkUser.afk < 0) continue

        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
@${jid.split("@")[0]} está AFK
Motivo: ${afkUser.afkReason || 'Sin motivo'}
Tiempo AFK: ${formatAFK(Date.now() - afkUser.afk)}`,
            m,
            { mentions: [jid] }
        )
    }

    return true
}

// Esto permite que reconozca el comando .afk
afkHandler.command = /^afk$/i
afkHandler.register = true
afkHandler.before = true

export default afkHandler
