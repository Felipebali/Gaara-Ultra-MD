// plugins/warnlist.js
let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)

  const chatId = m.chat
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
  if (!global.db.data.chats[chatId].warns) global.db.data.chats[chatId].warns = {}

  const warns = global.db.data.chats[chatId].warns
  const entries = Object.entries(warns)

  if (entries.length === 0) return conn.reply(chatId, 'ℹ️ No hay advertencias en este grupo.', m)

  let text = '⚠️ *Advertencias actuales:*\n'
  const mentions = []
  for (let [jid, count] of entries) {
    mentions.push(jid)
    const name = await conn.getName(jid).catch(()=> jid.split('@')[0])
    text += `• ${name}: ${count}/5\n`
  }

  await conn.sendMessage(chatId, { text, mentions }, { quoted: m })
}

handler.help = ['warnlist','advertencias','listaadv']
handler.tags = ['admin']
handler.command = ['warnlist','advertencias','listaadv']
handler.group = true
handler.admin = true
handler.register = true

export default handler
