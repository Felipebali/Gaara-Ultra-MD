// plugins/unwarn.js
let handler = async (m, { conn, isAdmin, isROwner }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)
  if (!isAdmin && !isROwner) return conn.reply(m.chat, '⚠️ Solo los administradores pueden quitar advertencias.', m)

  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return conn.reply(m.chat, '👤 Menciona o responde al mensaje del usuario para quitarle advertencias.', m)

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  const warns = chat.warns || (chat.warns = {})

  if (!warns[target] || !warns[target].count) return conn.reply(m.chat, '✅ Ese usuario no tiene advertencias.', m)

  // Reducir la advertencia y mantener fecha/jid
  warns[target].count = Math.max(0, warns[target].count)
  warns[target].count -= 1
  await global.db.write()

  const name = conn.getName(target) || target.split('@')[0]

  return conn.sendMessage(m.chat, { 
    text: `🟢 ${name} ahora tiene ${warns[target].count}/3 advertencias.`, 
    mentions: [target] 
  }, { quoted: m })
}

handler.command = ['unwarn', 'quitarwarn', 'sacarwarn']
handler.group = true
handler.admin = true
export default handler
