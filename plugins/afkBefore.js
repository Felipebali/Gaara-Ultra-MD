// plugins/afkBefore.js
let handler = async (m, { conn }) => {
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    let user = global.db.data.users[m.sender]

    const formatAFK = (ms) => {
        let total = Math.floor(ms / 1000)
        let h = Math.floor(total / 3600)
        let m = Math.floor((total % 3600) / 60)
        let s = total % 60
        return `${h}h ${m}m ${s}s`
    }

    // --- Desactivar AFK si el usuario envía mensaje ---
    if (user.afk && user.afk > 0) {
        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
@${m.sender.split('@')[0]} ya no estás AFK
Motivo anterior: ${user.afkReason || 'Sin motivo'}
Tiempo AFK: ${formatAFK(Date.now() - user.afk)}`,
            m,
            { mentions: [m.sender] }
        )
        user.afk = 0
        user.afkReason = ''
    }

    // --- Avisar si mencionan a alguien AFK ---
    let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    for (let jid of jids) {
        if (!global.db.data.users[jid]) continue
        let afkUser = global.db.data.users[jid]
        if (!afkUser.afk || afkUser.afk <= 0) continue

        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
@${jid.split('@')[0]} está AFK
Motivo: ${afkUser.afkReason || 'Sin motivo'}
Tiempo AFK: ${formatAFK(Date.now() - afkUser.afk)}`,
            m,
            { mentions: [jid] }
        )
    }

    return true
}

handler.before = true
export default handler
