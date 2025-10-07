// plugins/warnlist.js
let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  const warns = chat.warns || (chat.warns = {})

  const users = Object.entries(warns).filter(([jid, count]) => count > 0)
  if (users.length === 0) return conn.reply(m.chat, '✅ No hay advertencias registradas en este grupo.', m)

  let text = '⚠️ *Advertencias actuales:*\n\n'
  const mentions = []
  for (const [jid, count] of users) {
    const name = await conn.getName(jid).catch(() => jid.split('@')[0])
    mentions.push(jid)
    text += `• ${name}: ${count}/5\n`
  }

  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
}

handler.command = ['warnlist', 'advertencias', 'listaadv']
handler.group = true
handler.admin = true
export default handler
