let handler = async (m, { conn, args }) => {
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    let user = global.db.data.users[m.sender]

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
}

handler.command = /^afk$/i
export default handler
