// plugins/grupo-warn.js
let handler = async (m, { conn, command, isAdmin, isOwner }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❗ Solo en grupos.', m)
  if (!isAdmin && !isOwner && !['warnlist'].includes(command)) return conn.reply(m.chat, '🚫 Solo administradores.', m)

  // Detectar usuario
  const who = m.mentionedJid?.[0] || m.quoted?.sender
  if (!who && !['warnlist'].includes(command)) return conn.reply(m.chat, '📌 Menciona o responde al mensaje del usuario.', m)

  // Inicializar DB del chat
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chatDB = global.db.data.chats[m.chat]
  if (!chatDB.warns) chatDB.warns = {}
  const warns = chatDB.warns

  // Obtener nombre seguro sin usar .catch()
  let name
  try { name = who ? await conn.getName(who) : "Desconocido" } catch { name = who ? who.split("@")[0] : "Desconocido" }

  // ===== DAR ADVERTENCIA =====
  if (['warn','advertir','ad','advertencia'].includes(command)) {
    warns[who] = warns[who] || { count: 0 }
    warns[who].count += 1
    await global.db.write()

    await conn.sendMessage(m.chat, {
      text: `⚠️ ${name} recibió una advertencia. (${warns[who].count}/3)`,
      mentions: [who]
    })
  }

  // ===== QUITAR ADVERTENCIA =====
  else if (['unwarn','quitarwarn','sacarwarn'].includes(command)) {
    if (!warns[who]?.count || warns[who].count === 0) {
      return conn.sendMessage(m.chat, { 
        text: `✅ ${name} no tiene advertencias.`,
        mentions: who ? [who] : []
      })
    }

    warns[who].count = Math.max(0, warns[who].count - 1)
    await global.db.write()

    await conn.sendMessage(m.chat, {
      text: `🟢 ${name} ahora tiene ${warns[who].count}/3 advertencias.`,
      mentions: [who]
    })
  }

  // ===== LISTA DE ADVERTENCIAS =====
  else if (command === 'warnlist') {
    const entries = Object.entries(warns).filter(([_, w]) => w.count > 0)
    if (!entries.length) return conn.sendMessage(m.chat, { text: '✅ No hay advertencias activas en este grupo.' })

    let txt = '⚠️ Lista de advertencias:\n'
    const mentions = []

    for (const [jid, data] of entries) {
      let n
      try { n = await conn.getName(jid) } catch { n = jid.split("@")[0] }
      txt += `• ${n}: ${data.count}/3\n`
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
