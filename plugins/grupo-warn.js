// plugins/grupo-warn.js
function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin, isROwner }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

  // ---------- WARN ----------
  if (['advertencia','ad','daradvertencia','advertir','warn'].includes(command)) {
    if (!isAdmin) return m.reply('❌ Solo administradores pueden advertir.')
    if (!isBotAdmin) return m.reply('❌ Necesito ser administrador para eliminar usuarios.')

    const user = m.mentionedJid?.[0] || m.quoted?.sender
    if (!user) return m.reply(`❌ Debes mencionar o responder a alguien.\nEjemplo: ${usedPrefix}${command} @usuario`)

    const chatDB = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chatDB.warns) chatDB.warns = {}
    const warns = chatDB.warns

    warns[user] = warns[user] || { count: 0 }
    warns[user].count += 1
    const count = warns[user].count
    await global.db.write()

    // Nombres
    let userName, senderName
    try { userName = await conn.getName(user) } catch { userName = user.split("@")[0] }
    try { senderName = await conn.getName(m.sender) } catch { senderName = m.sender.split("@")[0] }

    if (count >= 3) {
      const msg = `🚫 @${userName} fue eliminado por acumular 3 advertencias.`
      try {
        await conn.sendMessage(m.chat, { text: msg, mentions: [user] })
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        delete warns[user]
        await global.db.write()
      } catch (e) {
        console.error(e)
        return m.reply('❌ No se pudo eliminar al usuario. Verifica permisos del bot.')
      }
    } else {
      const restantes = 3 - count
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${userName} recibió una advertencia. (${count}/3)\n🕒 Restan ${restantes} antes de ser expulsado.`,
        mentions: [user]
      })
    }
  }

  // ---------- UNWARN ----------
  else if (['unwarn','quitarwarn','sacarwarn'].includes(command)) {
    if (!isAdmin && !isROwner) return m.reply('⚠️ Solo los administradores pueden quitar advertencias.')
    const target = m.quoted?.sender || m.mentionedJid?.[0]
    if (!target) return m.reply('❌ Menciona o responde al mensaje del usuario para quitarle advertencias.')

    const chatDB = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chatDB.warns) chatDB.warns = {}
    const warns = chatDB.warns

    if (!warns[target] || !warns[target].count)
      return conn.sendMessage(m.chat, { text: `✅ @${target.split("@")[0]} no tiene advertencias.`, mentions: [target] })

    warns[target].count = Math.max(0, warns[target].count - 1)
    await global.db.write()

    let name
    try { name = await conn.getName(target) } catch { name = target.split("@")[0] }

    await conn.sendMessage(m.chat, {
      text: `🟢 @${name} ahora tiene ${warns[target].count}/3 advertencias.`,
      mentions: [target]
    })
  }

  // ---------- WARNLIST ----------
  else if (['warnlist','advertencias','listaad'].includes(command)) {
    const chatDB = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chatDB.warns) chatDB.warns = {}
    const warns = chatDB.warns

    const entries = Object.entries(warns).filter(([_, w]) => w.count && w.count > 0)
    if (entries.length === 0) return m.reply('✅ No hay usuarios con advertencias.')

    let textList = '⚠️ *Usuarios con advertencias:*\n\n'
    let mentions = []

    for (const [jid, w] of entries) {
      textList += `• @${jid.split('@')[0]} → ${w.count}/3\n`
      mentions.push(jid)
    }

    await conn.sendMessage(m.chat, { text: textList.trim(), mentions })
  }
}

handler.command = ['advertencia','ad','daradvertencia','advertir','warn','unwarn','quitarwarn','sacarwarn','warnlist','advertencias','listaad']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
