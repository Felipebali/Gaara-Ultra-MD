// plugins/grupo-warn.js
const handler = async (m, { conn, text, usedPrefix, command, groupMetadata, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('❌ Necesito ser administrador para poder eliminar usuarios.')

  const user = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  const reason = text.split(" ").slice(1).join(" ")

  if (!user) return m.reply(`❗ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario razón*`)
  if (!reason) return m.reply('❗ Debes escribir el motivo de la advertencia.')

  const date = new Date().toLocaleDateString('es-ES')

  // Inicializar advertencias
  if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
  const currentWarns = global.db.data.chats[m.chat].warns[user] || { count: 0 }
  const newWarnCount = currentWarns.count + 1
  global.db.data.chats[m.chat].warns[user] = { count: newWarnCount, date }

  // Nombres seguros
  const senderName = conn.getName ? conn.getName(m.sender) : m.sender.split('@')[0]
  const userName = conn.getName ? conn.getName(user) : user.split('@')[0]

  if (newWarnCount >= 3) {
    try {
      await conn.sendMessage(m.chat, {
        text: `🚫 *USUARIO ELIMINADO* 🚫\n\n👤 *Usuario:* @${user.split('@')[0]}\n👮‍♂️ *Moderador:* ${senderName}\n📅 *Fecha:* ${date}\n⚠️ *Advertencias:* ${newWarnCount}/3\n\n📝 *Motivo:*\n${reason}\n\n❌ *El usuario ha sido eliminado del grupo por acumular 3 advertencias.*`,
        mentions: [user]
      })
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      delete global.db.data.chats[m.chat].warns[user]
    } catch (e) {
      console.error(e)
      return m.reply('❌ No se pudo eliminar al usuario. Verifica que el bot tenga permisos de administrador.')
    }
  } else {
    await conn.sendMessage(m.chat, {
      text: `⚠️ *ADVERTENCIA ${newWarnCount}/3* ⚠️\n\n👤 *Usuario:* @${user.split('@')[0]}\n👮‍♂️ *Moderador:* ${senderName}\n📅 *Fecha:* ${date}\n\n📝 *Motivo:*\n${reason}\n\n${newWarnCount === 2 ? '🔥 *¡ÚLTIMA ADVERTENCIA!* La próxima resultará en eliminación
