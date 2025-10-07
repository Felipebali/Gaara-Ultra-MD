// plugins/warnlist.js
let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)

    const chatId = m.chat
    global.db.data = global.db.data || {}
    global.db.data.chats = global.db.data.chats || {}
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
    if (!global.db.data.chats[chatId].warns) global.db.data.chats[chatId].warns = {}

    const warns = global.db.data.chats[chatId].warns
    const entries = Object.entries(warns).filter(([jid, count]) => count > 0)
    if (entries.length === 0) return conn.reply(chatId, '✅ No hay usuarios advertidos actualmente.', m)

    let text = '⚠️ *Advertencias actuales:*\n\n'
    const mentions = []
    for (let [jid, count] of entries) {
      mentions.push(jid)
      let name = jid.split('@')[0]
      try { name = await conn.getName(jid) } catch {}
      text += `• ${name} (@${jid.split('@')[0]}) → ${count}/5\n`
    }
    text += `\n🗒️ Si un usuario llega a 5 advertencias, será expulsado (si no es admin).`
    await conn.sendMessage(chatId, { text, mentions }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Error al obtener la lista.', m)
  }
}

handler.help = ['warnlist','advertencias','listaadv']
handler.tags = ['admin']
handler.command = ['warnlist','advertencias','listaadv']
handler.group = true
handler.admin = true
handler.register = true

export default handler
