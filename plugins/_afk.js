let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    
    // Si el usuario estaba AFK y envía mensaje, lo "desactiva"
    if (user.afk > -1) {
        let who = m.sender
        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
*▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔*
@${who.split("@")[0]}, ya no estás AFK.
${user.afkReason ? 'Motivo: ' + user.afkReason : ''}
Tiempo AFK: ${new Date(new Date() - user.afk).toTimeString()}`,
            m,
            { mentions: [who] }
        )
        user.afk = -1
        user.afkReason = ''
    }

    // Avisar si mencionan a alguien AFK
    let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    for (let jid of jids) {
        let afkUser = global.db.data.users[jid]
        if (!afkUser) continue
        if (!afkUser.afk || afkUser.afk < 0) continue
        await conn.reply(
            m.chat,
            `✴️ *A F K* ✴️
*▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔*
@${jid.split("@")[0]} está AFK.
${afkUser.afkReason ? 'Motivo: ' + afkUser.afkReason : 'Sin motivo'}
Tiempo AFK: ${new Date(new Date() - afkUser.afk).toTimeString()}`,
            m,
            { mentions: [jid] }
        )
    }

    return true
}

export default handler
