// plugins/grupo-warn.js
const handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('✦ Este comando solo se puede usar en grupos.')
    if (!isAdmin) return m.reply('✦ Solo los administradores pueden usar este comando.')
    if (!isBotAdmin) return m.reply('✦ Necesito ser administrador para poder eliminar usuarios.')

    const user = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender)
    const mensaje = text.split(" ").slice(1).join(" ").trim()

    if (!user) return m.reply(`✦ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario texto*`)

    const date = new Date().toLocaleDateString('es-ES')

    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chat.warns) chat.warns = {}
    const warns = chat.warns

    const currentWarns = warns[user] || {}
    const currentCount = Number(currentWarns.count) || 0
    const newWarnCount = currentCount + 1

    warns[user] = { count: newWarnCount, date: date }
    await global.db.write()

    let senderName = userName = user.split('@')[0]
    try { senderName = await conn.getName(m.sender) } catch {}
    try { userName = await conn.getName(user) } catch {}

    if (newWarnCount >= 3) {
        const texto = `🚫 *USUARIO ELIMINADO* 🚫

👤 @${user.split('@')[0]}
👮‍♂️ Moderador: ${senderName}
📅 Fecha: ${date}
⚠️ Advertencias: ${newWarnCount}/3

${mensaje ? mensaje : 'Sin motivo especificado'}

❌ El usuario ha sido eliminado por acumular 3 advertencias.`

        try {
            await conn.sendMessage(m.chat, { text: texto, mentions: [user, m.sender] }, { quoted: m })
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            delete warns[user]
            await global.db.write()
        } catch (e) {
            console.error(e)
            m.reply('❌ No se pudo eliminar al usuario. Verifica que el bot tenga permisos de administrador.')
        }
    } else {
        const texto = `⚠️ *ADVERTENCIA ${newWarnCount}/3* ⚠️

👤 @${user.split('@')[0]}
👮‍♂️ Moderador: ${senderName}
📅 Fecha: ${date}

${mensaje ? mensaje : 'Sin motivo especificado'}

${newWarnCount === 2
            ? '🔥 ¡ÚLTIMA ADVERTENCIA! La próxima advertencia resultará en eliminación del grupo.'
            : `❗ Te quedan ${3 - newWarnCount} advertencias.`}`

        try {
            await conn.sendMessage(m.chat, { text: texto, mentions: [user, m.sender] }, { quoted: m })
        } catch (e) {
            console.error(e)
            m.reply('❌ No se pudo enviar la advertencia.')
        }
    }
}

handler.command = ['advertencia','ad','daradvertencia','advertir','warn']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = false
export default handler
