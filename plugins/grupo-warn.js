// plugins/grupo-warn.js
function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin, isROwner }) => {
  if (!m.isGroup) return m.reply('🚫 Este comando solo se puede usar en grupos.')

  // ---------- ⚠️ DAR ADVERTENCIA ----------
  if (['advertencia', 'ad', 'daradvertencia', 'advertir', 'warn'].includes(command)) {
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden advertir.')
    if (!isBotAdmin) return m.reply('🤖 Necesito ser administrador para poder eliminar usuarios.')

    const userRaw = m.mentionedJid?.[0] || m.quoted?.sender
    const user = normalizeJid(userRaw)
    if (!user) return m.reply(`⚠️ Debes mencionar o responder a alguien.\n📌 Ejemplo: ${usedPrefix}${command} @usuario [motivo]`)

    // --- Limpiar el texto para obtener el motivo correctamente ---
    let motivo = text?.trim()
      .replace(new RegExp(`^@${user.split('@')[0]}`, 'gi'), '')
      .replace(new RegExp(`^${usedPrefix}${command}`, 'gi'), '')
      .trim()

    if (!motivo) motivo = 'Sin especificar 💤'

    const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

    const chatDB = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chatDB.warns) chatDB.warns = {}
    const warns = chatDB.warns

    // 🔒 Asegurar estructura antes del push
    if (!warns[user]) warns[user] = { count: 0, motivos: [] }
    if (!Array.isArray(warns[user].motivos)) warns[user].motivos = []

    warns[user].count += 1
    warns[user].motivos.push({ motivo, fecha })
    const count = warns[user].count
    await global.db.write()

    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })

    // Si llega a 3 advertencias → eliminar
    if (count >= 3) {
      const msg = `🚫 *El usuario @${user.split('@')[0]} fue eliminado por acumular 3 advertencias.*\n🧹 Adiós 👋`
      try {
        await conn.sendMessage(m.chat, { text: msg, mentions: [user] })
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        delete warns[user]
        await global.db.write()
      } catch (e) {
        console.error(e)
        return m.reply('❌ No se pudo eliminar al usuario. Verifica los permisos del bot.')
      }
    } else {
      const restantes = 3 - count
      await conn.sendMessage(m.chat, {
        text: `⚠️ *Advertencia para:* @${user.split('@')[0]}\n🧾 *Motivo:* ${motivo}\n📅 *Fecha:* ${fecha}\n\n📋 *Advertencias:* ${count}/3\n🕒 Restan *${restantes}* antes de ser expulsado.`,
        mentions: [user]
      })
    }
  }

  // ---------- 🟢 QUITAR ADVERTENCIA ----------
  else if (['unwarn', 'quitarwarn', 'sacarwarn'].includes(command)) {
    if (!isAdmin && !isROwner) return m.reply('⚠️ Solo los administradores o el dueño pueden quitar advertencias.')

    const targetRaw = m.quoted?.sender || m.mentionedJid?.[0]
    const target = normalizeJid(targetRaw)
    if (!target) return m.reply('❌ Debes mencionar o responder al mensaje del usuario para quitarle una advertencia.')

    const chatDB = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chatDB.warns) chatDB.warns = {}
    const warns = chatDB.warns

    if (!warns[target] || !warns[target].count)
      return conn.sendMessage(m.chat, { text: `✅ @${target.split('@')[0]} no tiene advertencias.`, mentions: [target] })

    warns[target].count = Math.max(0, warns[target].count - 1)
    warns[target].motivos?.pop()
    // Si count llega a 0 y no quieres mantener el objeto, puedes eliminarlo:
    if (warns[target].count === 0 && (!warns[target].motivos || warns[target].motivos.length === 0)) delete warns[target]
    await global.db.write()

    await conn.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })
    await conn.sendMessage(m.chat, {
      text: `🟢 *Advertencia retirada a:* @${target.split('@')[0]}\n📋 Ahora tiene *${warns[target]?.count || 0}/3* advertencias.`,
      mentions: [target]
    })
  }

  // ---------- 📜 LISTA DE ADVERTENCIAS ----------
  else if (['warnlist', 'advertencias', 'listaad'].includes(command)) {
    const chatDB = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chatDB.warns) chatDB.warns = {}
    const warns = chatDB.warns

    const entries = Object.entries(warns).filter(([_, w]) => w.count && w.count > 0)
    if (entries.length === 0) return m.reply('✅ No hay usuarios con advertencias en este grupo.')

    let textList = '⚠️ *Usuarios con advertencias:*\n\n'
    let mentions = []

    for (const [jid, w] of entries) {
      const normJid = normalizeJid(jid)
      textList += `👤 @${normJid.split('@')[0]} → ${w.count}/3\n`
      if (w.motivos?.length) {
        w.motivos.slice(-3).forEach((m, i) => {
          textList += `   ${i + 1}. ${m.motivo} — 🗓️ ${m.fecha}\n`
        })
      }
      textList += '\n'
      mentions.push(normJid)
    }

    await conn.sendMessage(m.chat, {
      text: textList.trim(),
      mentions
    })
  }
}

handler.command = [
  'advertencia','ad','daradvertencia','advertir','warn',
  'unwarn','quitarwarn','sacarwarn',
  'warnlist','advertencias','listaad'
]
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
