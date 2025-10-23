// plugins/grupo-warn.js
let handler = async (m, { conn, command, text, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, '❗ Este comando solo puede usarse en grupos.', m)
    if (!isAdmin && !isOwner) return conn.reply(m.chat, '🚫 Solo administradores pueden usar estos comandos.', m)

    // Inicializar DB del chat
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    const chatDB = global.db.data.chats[m.chat]
    if (!chatDB.warns) chatDB.warns = {}
    const warns = chatDB.warns

    const action = command.toLowerCase()

    // ===== LISTA DE ADVERTIDOS =====
    if (['warnlist','listaadvertidos','listwarn'].includes(action)) {
      const advertidos = Object.entries(warns).filter(([jid, data]) => data?.count > 0)
      if (!advertidos.length) return conn.sendMessage(m.chat, { text: '✅ No hay usuarios advertidos.' })

      let mentions = []
      let lista = '⚠️ *LISTA NEGRA DE ADVERTENCIAS*\n\n'
      for (const [jid, data] of advertidos) {
        let name = jid.split('@')[0]
        try { name = await conn.getName(jid) } catch {}
        lista += `• ${name} — ${data.count}/3 ⚠️ (${data.date})\n`
        mentions.push(jid)
      }

      return conn.sendMessage(m.chat, { text: lista.trim(), mentions })
    }

    // ===== DAR ADVERTENCIA =====
    else if (['warn','advertir','ad','advertencia'].includes(action)) {
      const user = m.mentionedJid?.[0] || m.quoted?.sender
      if (!user) return conn.reply(m.chat, '📌 Etiqueta o responde a un usuario para advertirlo.', m)

      const motivo = text.split(' ').slice(1).join(' ').trim() || 'Sin motivo especificado'

      // Nombres visibles
      let userName, senderName
      try { userName = await conn.getName(user) } catch { userName = user.split('@')[0] }
      try { senderName = await conn.getName(m.sender) } catch { senderName = m.sender.split('@')[0] }

      // Nombre limpio para mención clickeable
      const userClean = user.split('@')[0]
      const senderClean = m.sender.split('@')[0]

      // Actualizar advertencias
      warns[user] = warns[user] || { count: 0, date: null }
      warns[user].count += 1
      warns[user].date = new Date().toLocaleDateString('es-ES')
      await global.db.write()

      const newCount = warns[user].count
      const mentionsArray = [user, m.sender]

      if (newCount >= 3) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
          warns[user].count = 0
          await global.db.write()
          return conn.sendMessage(m.chat, { 
            text: `🚫 *${userName}* fue expulsado por acumular 3 advertencias.\n📝 Motivo: ${motivo}\n👮‍♂️ Moderador: ${senderName}`,
            mentions: mentionsArray
          })
        } catch (e) {
          console.error(e)
          return conn.reply(m.chat, '❌ No se pudo expulsar al usuario. Verifica permisos.', m)
        }
      } else {
        const extra = newCount === 2 ? '🔥 Última advertencia antes de expulsión.' : `🕒 Restan ${3 - newCount} antes de ser expulsado.`
        return conn.sendMessage(m.chat, { 
          text: `⚠️ *${userName}* recibió una advertencia.\n📊 Advertencias: ${newCount}/3\n📝 Motivo: ${motivo}\n👮‍♂️ Moderador: ${senderName}\n${extra}`,
          mentions: mentionsArray
        })
      }
    }

    // ===== QUITAR ADVERTENCIA =====
    else if (['unwarn','quitarwarn','sacarwarn'].includes(action)) {
      const user = m.mentionedJid?.[0] || m.quoted?.sender
      if (!user) return conn.reply(m.chat, '📌 Etiqueta o responde a un usuario para quitarle advertencias.', m)

      if (!warns[user]?.count || warns[user].count === 0)
        return conn.sendMessage(m.chat, { text: `✅ *${await conn.getName(user).catch(()=>user.split('@')[0])}* no tiene advertencias.`, mentions: [user] })

      warns[user].count = Math.max(0, warns[user].count - 1)
      await global.db.write()
      return conn.sendMessage(m.chat, { 
        text: `🟢 *${await conn.getName(user).catch(()=>user.split('@')[0])}* ahora tiene ${warns[user].count}/3 advertencias.`, 
        mentions: [user] 
      })
    }

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Ocurrió un error al ejecutar el comando.', m)
  }
}

handler.command = ['warn','advertir','ad','advertencia','unwarn','quitarwarn','sacarwarn','warnlist','listaadvertidos','listwarn']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
