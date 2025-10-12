let handler = (m) => m

handler.before = async function (m, { conn }) {
    let user = global.db.data.users[m.sender]
    
    // Si el usuario estaba AFK y envía mensaje, lo "desactiva"
    if (user.afk > -1) {
        await conn.reply(
            m.chat,
            `${lenguajeGB['smsAvisoEG']()}✴️ *A F K* ✴️   *▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔*   *@${m.sender.split('@')[0]}* ${lenguajeGB['smsAfkM1']()}${user.afkReason ? '\n' + lenguajeGB['smsAfkM2']() + '👉 ' + user.afkReason : ''}

${lenguajeGB['smsAfkM3']()}\n👉 *${new Date(new Date() - user.afk).toTimeString()}*`,
            m,
            { mentions: [m.sender] }
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
        let reason = afkUser.afkReason || ''
        await conn.reply(
            m.chat,
            `${lenguajeGB['smsAvisoAG']()}✴️ *A F K* ✴️
*▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔*
😾 ${lenguajeGB['smsAfkM4']()}\n${reason ? lenguajeGB['smsAfkM5']() + '👉 ' + reason : lenguajeGB['smsAfkM6']()}

${lenguajeGB['smsAfkM3']()}\n👉 *${new Date(new Date() - afkUser.afk).toTimeString()}*`,
            m
        )
    }

    return true
}

export default handler
