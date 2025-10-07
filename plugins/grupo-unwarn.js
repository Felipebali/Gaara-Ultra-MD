// plugins/unwarn.js
let handler = async (m, { conn, args, isAdmin, isROwner }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)
  if (!isAdmin && !isROwner) return conn.reply(m.chat, '❌ Solo administradores pueden usar esto.', m)

  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return conn.reply(m.chat, '❗ Menciona o responde al mensaje del usuario.', m)

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
  const warns = global.db.data.chats[m.chat].warns

  if (!warns[target]) return conn.reply(m.chat, 'ℹ️ Este usuario no tiene advertencias.', m)

  if (args[0] && args[0].toLowerCase() === 'reset') {
    delete warns[target]
    await global.db.write()
    return conn.reply(m.chat, `✅ Advertencias de @${target.split('@')[0]} reiniciadas.`, m, { mentions: [target] })
  }

  warns[target] = Math.max(0, (warns[target] || 0) - 1)
  if (warns[target] === 0) delete warns[target]
  await global.db.write()
  return conn.reply(m.chat, `✅ Advertencia reducida. @${target.split('@')[0]} ahora tiene ${warns[target] || 0}/5`, m, { mentions: [target] })
}

handler.help = ['unwarn','desadvertir']
handler.tags = ['admin']
handler.command = ['unwarn','desadvertir']
handler.group = true
handler.admin = true
handler.register = true

export default handler
