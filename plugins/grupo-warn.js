// plugins/warn.js
const handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin, isROwner }) => {
  if (!m.isGroup) return m.reply('✦ Este comando solo se puede usar en grupos.')
  if (!isAdmin && !isROwner) return m.reply('✦ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('✦ Necesito ser administrador para poder eliminar usuarios.')

  const args = text.trim().split(/\s+/)
  const action = command.toLowerCase()
  const user = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender)
  const motivo = args.slice(1).join(' ').trim()
  const date = new Date().toLocaleDateString('es-ES')

  const chat = global.db.data.chats[m.chat] ||= {}
  chat.warns ||= {}
  const warns = chat.warns

  // 🧾 Listar advertidos
  if (action.includes('list')) {
    const lista = Object.entries(warns)
      .filter(([_, data]) => data.count > 0)
      .map(([jid, data], i) => {
        const usuario = jid.split('@')[0]
        return `${i + 1}. @${usuario} — ${data.count}/3 ⚠️ (${data.date})`
      })
      .join('\n')

    if (!lista) return m.reply('✅ No hay usuarios advertidos en este grupo.')

    const texto = `⚠️ *LISTA DE ADVERTIDOS*\n\n${lista}`
    return conn.sendMessage(m.chat, { text: texto, mentions: Object.keys(warns) })
  }

  // 🟢 Quitar advertencia
  if (action.includes('un')) {
    if (!user) return m.reply('👤 Menciona o responde al mensaje del usuario para quitarle advertencias.')
    if (!warns[user]?.count) return m.reply('✅ Ese usuario no tiene advertencias.')

    warns[user].count = Math.max(0, warns[user].count - 1)
    await global.db.write()

    const userName = await conn.getName(user).catch(() => user.split('@')[0])
    const texto = `🟢 @${userName} ahora tiene ${warns[user].count}/3 advertencias.`
    return conn.sendMessage(m.chat, { text: texto, mentions: [user] })
  }

  // ⚠️ Dar advertencia
  if (!user) return m.reply(`✦ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario texto*`)

  const current = warns[user]?.count || 0
  const newCount = current + 1
  warns[user] = { count: newCount, date }
  await global.db.write()

  const senderName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0])
  const userName = await conn.getName(user).catch(() => user.split('@')[0])

  if (newCount >= 3) {
    const texto = `🚫 *USUARIO ELIMINADO* 🚫

👤 @${userName}
👮‍♂️ Moderador: @${senderName}
📅 ${date}
⚠️ Advertencias: ${newCount}/3

${motivo || 'Sin motivo especificado'}

❌ El usuario ha sido eliminado por acumular 3 advertencias.`

    try {
      await conn.sendMessage(m.chat, { text: texto, mentions: [user, m.sender] })
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      delete warns[user]
      await global.db.write()
    } catch (e) {
      console.error(e)
      return m.reply('❌ No se pudo eliminar al usuario. Verifica que el bot tenga permisos de administrador.')
    }
  } else {
    const texto = `⚠️ *ADVERTENCIA ${newCount}/3* ⚠️

👤 @${userName}
👮‍♂️ Moderador: @${senderName}
📅 ${date}

${motivo || 'Sin motivo especificado'}

${newCount === 2
      ? '🔥 ¡ÚLTIMA ADVERTENCIA! La próxima advertencia resultará en eliminación del grupo.'
      : `❗ Te quedan ${3 - newCount} advertencias.`}`

    try {
      await conn.sendMessage(m.chat, { text: texto, mentions: [user, m.sender] })
    } catch (e) {
      console.error(e)
      return m.reply('❌ No se pudo enviar la advertencia.')
    }
  }
}

handler.command = [
  'warn', 'advertencia', 'ad', 'advertir',
  'unwarn', 'quitarwarn', 'sacarwarn',
  'warnlist', 'listaadvertidos', 'listwarn'
]
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
