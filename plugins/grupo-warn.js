// plugins/grupo-warn.js
let handler = async (m, { conn, command, text, isAdmin, isOwner }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❗ Solo en grupos.', m)
  if (!isAdmin && !isOwner && !['warnlist'].includes(command)) return conn.reply(m.chat, '🚫 Solo administradores.', m)

  // Detectar usuario
  const user = m.mentionedJid?.[0] || m.quoted?.sender

  // Inicializar DB del chat
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chatDB = global.db.data.chats[m.chat]
  if (!chatDB.warns) chatDB.warns = {}
  const warns = chatDB.warns

  // Obtener nombres de manera segura
  let userName = user ? user.split('@')[0] : ''
  let senderName = m.sender.split('@')[0]
  try { if(user) userName = await conn.getName(user) } catch {}
  try { senderName = await conn.getName(m.sender) } catch {}

  const mentionsArray = user ? [user, m.sender] : []

  // ===== DAR ADVERTENCIA =====
  if (['warn','advertir','ad','advertencia'].includes(command)) {
    if (!user) return conn.reply(m.chat, '📌 Menciona o responde al mensaje del usuario.', m)
    const motivo = text.split(' ').slice(1).join(' ').trim() || 'Sin motivo especificado'

    warns[user] = warns[user] || { count: 0 }
    warns[user].count += 1
    await global.db.write()

    const newCount = warns[user].count
    if (newCount >= 3) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        warns[user].count = 0
        await global.db.write()
        return conn.sendMessage(m.chat, {
          text: `🚫 *@${userName}* eliminado por acumular 3 advertencias.\n📝 ${motivo}\n👮‍♂️ Moderador: *@${senderName}*`,
          mentions: mentionsArray
        })
      } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '❌ No se pudo eliminar al usuario.', m)
      }
    } else {
      return conn.sendMessage(m.chat, {
        text: `⚠️ *@${userName}* recibió una advertencia. (${newCount}/3)\n📝 ${motivo}\n👮‍♂️ Moderador: *@${senderName}*`,
        mentions: mentionsArray
      })
    }
  }

  // ===== QUITAR ADVERTENCIA =====
  else if (['unwarn','quitarwarn','sacarwarn'].includes(command)) {
    if (!user) return conn.reply(m.chat, '📌 Menciona o responde al mensaje del usuario.', m)
    if (!warns[user]?.count || warns[user].count === 0)
      return conn.sendMessage(m.chat, { text: `✅ *@${userName}* no tiene advertencias.`, mentions: [user] })

    warns[user].count = Math.max(0, warns[user].count - 1)
    await global.db.write()

    return conn.sendMessage(m.chat, {
      text: `🟢 *@${userName}* ahora tiene ${warns[user].count}/3 advertencias.`,
      mentions: [user]
    })
  }

  // ===== LISTA DE ADVERTENCIAS =====
  else if (command === 'warnlist') {
    const entries = Object.entries(warns).filter(([_, w]) => w.count > 0)
    if (!entries.length) return conn.sendMessage(m.chat, { text: '✅ No hay advertencias activas en este grupo.' })

    let txt = '⚠️ *Lista de advertencias*\n\n'
    const mentions = []

    for (const [jid, data] of entries) {
      let name
      try { name = await conn.getName(jid) } catch { name = jid.split('@')[0] }
      txt += `• *@${name}*: ${data.count}/3\n`
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
