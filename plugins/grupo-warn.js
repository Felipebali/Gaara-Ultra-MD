// plugins/warn.js
let handler = async (m, { conn, participants, isAdmin, isROwner, isBotAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)
  if (!isAdmin && !isROwner) return conn.reply(m.chat, '⚠️ Solo los administradores pueden advertir usuarios.', m)

  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return conn.reply(m.chat, '👤 Menciona o responde al mensaje del usuario que quieres advertir.', m)

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  const warns = chat.warns || (chat.warns = {})

  warns[target] = (warns[target] || 0) + 1
  const count = warns[target]
  await global.db.write()

  const name = await conn.getName(target).catch(() => target.split('@')[0])

  if (count >= 5) {
    if (!isBotAdmin) return conn.reply(m.chat, '🤖 Necesito ser admin para eliminar usuarios.', m)

    try {
      await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
      delete warns[target]
      await global.db.write()
      return conn.sendMessage(m.chat, { text: `🚫 ${name} fue eliminado por alcanzar 5 advertencias.`, mentions: [target] }, { quoted: m })
    } catch (e) {
      console.error(e)
      return conn.reply(m.chat, '❌ Error al intentar eliminar al usuario.', m)
    }
  }

  return conn.sendMessage(m.chat, { text: `⚠️ ${name} tiene ${count}/5 advertencias.`, mentions: [target] }, { quoted: m })
}

handler.command = ['warn', 'advertir']
handler.group = true
handler.admin = true
export default handler
