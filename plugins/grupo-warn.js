// plugins/warn.js
const handler = async (m, { conn, text, usedPrefix, command, groupMetadata, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
    if (!isAdmin) return m.reply('⚠️ Solo los administradores pueden usar este comando.')
    if (!isBotAdmin) return m.reply('✖️ Necesito ser administrador para eliminar usuarios si llega a 3 advertencias.')

    const user = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender)
    if (!user) return m.reply(`✦ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario texto*`)

    const mensaje = text.split(" ").slice(1).join(" ").trim() || "Sin motivo"
    const date = new Date().toLocaleDateString('es-ES')

    // Inicializar sistema de advertencias
    if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
    const warns = global.db.data.chats[m.chat].warns

    // Obtener advertencias actuales
    const currentWarns = warns[user] || { count: 0, date: null }
    const newWarnCount = currentWarns.count + 1

    // Guardar advertencia
    warns[user] = { count: newWarnCount, date }
    await global.db.write()

    const senderName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0])
    const userName = await conn.getName(user).catch(() => user.split('@')[0])

    if (newWarnCount >= 3) {
        const texto = `🚫 *USUARIO ELIMINADO* 🚫

👤 @${user.split('@')[0]}
👮‍♂️ Moderador: ${senderName}
📅 Fecha: ${date}
⚠️ Advertencias: ${newWarnCount}/3

📝 Motivo: ${mensaje}

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

📝 Motivo: ${mensaje}

${newWarnCount === 2
            ? '🔥 ¡ÚLTIMA ADVERTENCIA! La próxima advertencia resultará en eliminación del grupo.'
            : `❗ Te quedan ${3 - newWarnCount} advertencias.`}`

        await conn.sendMessage(m.chat, { text: texto, mentions: [user, m.sender] }, { quoted: m })
    }
}

handler.command = ['advertencia','ad','daradvertencia','advertir','warn']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = false
export default handler
