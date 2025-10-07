let handler = async (m, { conn, isAdmin, isROwner }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)
  if (!isAdmin && !isROwner) return conn.reply(m.chat, '⚠️ Solo los administradores pueden quitar advertencias.', m)

  const target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return conn.reply(m.chat, '👤 Menciona o responde al mensaje del usuario para quitarle advertencias.', m)

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  const warns = chat.warns || (chat.warns = {})

  if (!warns[target] || !warns[target].count) 
    return conn.reply(m.chat, '✅ Ese usuario no tiene advertencias.', m)

  // Restar 1 al count sin eliminar el objeto
  warns[target].count = Math.max(0, warns[target].count - 1)
  await global.db.write()

  // Obtener nombre seguro
  let name
  try { name = conn.getName(target) } catch { name = target.split('@')[0] }

  return conn.sendMessage(m.chat, { text: `🟢 ${name} ahora tiene ${warns[target].count}/3 advertencias.`, mentions: [target] }, { quoted: m })
}

handler.command = ['unwarn', 'quitarwarn', 'sacarwarn']
handler.group = true
handler.admin = true
export default handler
