let handler = async (m, {text, args, usedPrefix, command, conn}) => {
    let user = global.db.data.users[m.sender]

    // Obtener texto del argumento o del mensaje citado
    if (args.length >= 1) {
        text = args.join(' ')
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else {
        return m.reply(`${lenguajeGB['smsAfkQ1'](usedPrefix, command)}`)
    }

    // Validar longitud mínima
    if (text.length < 10) return m.reply(`${lenguajeGB['smsAfkQ2']()}`)

    // Guardar estado AFK
    user.afk = +new Date()
    user.afkReason = text

    // Avisar en el chat
    await conn.reply(
        m.chat,
        `${lenguajeGB['smsAvisoAG']()}✴️ *A F K* ✴️   *▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔*   ${lenguajeGB['smsAfkM1A']()} *@${m.sender.split('@')[0]}* ${lenguajeGB['smsAfkM1B']()}${text ? '\n👉 ' + text : ''}`,
        m,
        {mentions: [m.sender]}
    )
}

handler.command = /^afk$/i
handler.register = true
export default handler 
