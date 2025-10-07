const handler = async (m, { conn, text, usedPrefix, command, groupMetadata, isAdmin, isBotAdmin }) => {

  if (!m.isGroup) return m.reply('✦ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('✦ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('✦ Necesito ser administrador para poder eliminar usuarios.')

  const user = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender)
  const mensaje = text.split(" ").slice(1).join(" ")

  if (!user) return m.reply(`✦ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario razón*`)
  if (!mensaje) return m.reply('✦ Debes escribir el motivo de la advertencia.')

  const date = new Date().toLocaleDateString('es-ES')

  // Inicializar warns si no existe
  if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
  const warns = global.db.data.chats[m.chat].warns

  // Obtener advertencias actuales
  const currentWarns = warns[user] || { count: 0 }
  const newWarnCount = currentWarns.count + 1

  // Guardar advertencia
  warns[user] = { count: newWarnCount, date: date }
  await global.db.write()

  // Nombres
  const senderName = conn.getName(m.sender)
  const userName = conn.getName(user)

  if (newWarnCount >= 3) {
    const texto = `🚫 *USUARIO ELIMINADO* 🚫

👤 *Usuario:* @${user.split('@')[0]}
👮‍♂️ *Moderador:* ${senderName}
📅 *Fecha:* ${date}
⚠️ *Advertencias:* ${newWarnCount}/3

📝 *Última razón:*
${mensaje}

❌ *El usuario ha sido eliminado del grupo por acumular 3 advertencias.*`

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

👤 *Usuario:* @${user.split('@')[0]}
👮‍♂️ *Moderador:* ${senderName}
📅 *Fecha:* ${date}

📝 *Motivo:*
${mensaje}

${newWarnCount === 2
      ? '🔥 *¡ÚLTIMA ADVERTENCIA!* La próxima advertencia resultará en eliminación del grupo.'
      : '❗ Por favor, evita futuras faltas. Te quedan ' + (3 - newWarnCount) + ' advertencias.'}`

    try {
      await conn.sendMessage(m.chat, { text: texto, mentions: [user, m.sender] }, { quoted: m })
    } catch (e) {
      console.error(e)
      m.reply('❌ No se pudo enviar la advertencia.')
    }
  }
}

handler.command = ['advertencia', 'ad', 'daradvertencia', 'advertir', 'warn']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler
