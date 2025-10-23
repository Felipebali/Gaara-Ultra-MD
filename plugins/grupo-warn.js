// plugins/grupo-warn.js
let handler = async (m, { conn, command, text, isAdmin, isOwner }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❗ Solo en grupos.', m)
  if (!isAdmin && !isOwner && !['warnlist'].includes(command)) return conn.reply(m.chat, '🚫 Solo administradores.', m)

  // Detectar usuario
  const user = m.mentionedJid?.[0] || m.quoted?.sender
  if (!user && ['warn','advertir','ad','advertencia','unwarn','quitarwarn','sacarwarn'].includes(command))
    return conn.reply(m.chat, '📌 Menciona o responde al mensaje del usuario.', m)

  // Inicializar DB del chat
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chatDB = global.db.data.chats[m.chat]
  if (!chatDB.warns) chatDB.warns = {}
  const warns = chatDB.warns

  // ===== Obtener nombre real y menciones =====
  let userName = ''
  try { userName = await conn.getName(user) } catch { userName = user.split('@')[0] }
  const mentionsArray = user ? [user] : []

  // ===== DAR ADVERTENCIA =====
  if (['warn','advertir','ad','advertencia'].includes(command)) {
    warns[user] = warns[user] || { count: 0 }
    warns[user].count += 1
    await global.db.write()

    const newCount = warns[user].count

    await conn.sendMessage(m.chat, {
      text: `⚠️ ${userName} recibió una advertencia. (${newCount}/3)`,
      mentions: mentionsArray
    })
  }

  // ===== QUITAR ADVERTENCIA =====
  else if (['unwarn','quitarwarn','sacarwarn'].includes(command)) {
    if (!warns[user]?.count || warns[user].count === 0)
      return conn.sendMessage(m.chat, { text: `✅ ${userName} no tiene advertencias.`, mentions: mentionsArray })

    warns[user].count = Math.max(0, warns[user].count - 1)
    await global.db.write()

    await conn.sendMessage(m.chat, {
      text: `🟢 ${userName} ahora tiene ${warns[user].count}/3 advertencias.`,
      mentions: mentionsArray
    })
  }

  // ===== LISTA DE ADVERTENCIAS =====
  else if (command === 'warnlist') {
    const entries = Object.entries(warns).filter(([_, w]) => w.count > 0)
    if (!entries.length) return conn.sendMessage(m.chat, { text: '✅ No hay advertencias activas en este grupo.' })

    let txt = '⚠️ Lista de advertencias:\n'
    const mentions = []

    for (const [jid, data] of entries) {
      let name = ''
      try { name = await conn.getName(jid) } catch { name = jid.split('@')[0] }
      txt += `• ${name}: ${data.count}/3\n`
      mentions.push(jid)
    }

    await conn.sendMessage(m.chat, { text: txt.trim(), mentions })
  }
}

handler.command = ['warn','advertir','ad','advertencia','unwarn','quitarwarn','sacarwarn','warnlist']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
