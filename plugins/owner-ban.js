// plugins/propietario-ln.js
function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net').replace(/@c\.us$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫'
  const done = '✅'
  const db = global.db.data.users || (global.db.data.users = {})

  // Reacciones por comando
  const reactions = { ln: '✅', unln: '☢️', cln: '👀', verln: '📜', usln: '🧹' }
  if (reactions[command]) await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  // Detectar usuario
  let userJid = null
  if (m.quoted) userJid = m.quoted.sender
  else if (m.mentionedJid?.length) userJid = m.mentionedJid[0]
  else if (text) {
    const num = text.match(/\d{5,}/)?.[0]
    if (num) userJid = `${num}@s.whatsapp.net`
  }

  // Motivo limpio
  let reason = text ? text.replace(/@\S/g, '').replace(/\d/g, '').trim() : ''
  if (!reason) reason = 'No especificado'

  if (!userJid && !['verln', 'usln'].includes(command))
    return conn.reply(m.chat, `${emoji} Debes responder, mencionar o escribir el número del usuario.`, m)

  if (userJid && !db[userJid]) db[userJid] = {}

  // ---------- LN (agregar a lista negra) ----------
  if (command === 'ln') {
    db[userJid].banned = true
    db[userJid].banReason = reason
    db[userJid].bannedBy = m.sender

    await conn.sendMessage(m.chat, {
      text: `${done} @${userJid.split('@')[0]} fue agregado a la lista negra.\nMotivo: ${reason}`,
      mentions: [userJid]
    })

    // Expulsar de todos los grupos
    const groups = Object.entries(await conn.groupFetchAllParticipating())
    for (const [jid, group] of groups) {
      const member = group.participants.find(p => normalizeJid(p.id) === normalizeJid(userJid))
      if (member) {
        try {
          await conn.sendMessage(jid, {
            text: `🚫 @${userJid.split('@')[0]} está en la lista negra y será eliminado automáticamente.\nMotivo: ${reason}`,
            mentions: [userJid]
          })
          await new Promise(r => setTimeout(r, 500))
          await conn.groupParticipantsUpdate(jid, [member.id], 'remove')
          console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject}`)
        } catch (e) {
          console.log(`⚠️ No se pudo expulsar de ${group.subject}: ${e.message}`)
        }
      }
    }
  }

  // ---------- UNLN (quitar de lista negra) ----------
  else if (command === 'unln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `${emoji} @${userJid.split('@')[0]} no está en la lista negra.`, mentions: [userJid] })

    db[userJid].banned = false
    db[userJid].banReason = ''
    db[userJid].bannedBy = null

    await conn.sendMessage(m.chat, {
      text: `${done} @${userJid.split('@')[0]} fue eliminado de la lista negra.`,
      mentions: [userJid]
    })
  }

  // ---------- CLN (verificar si está en lista negra) ----------
  else if (command === 'cln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `✅ @${userJid.split('@')[0]} no está en la lista negra.`, mentions: [userJid] })

    await conn.sendMessage(m.chat, {
      text: `${emoji} @${userJid.split('@')[0]} está en la lista negra.\nMotivo: ${db[userJid].banReason || 'No especificado'}`,
      mentions: [userJid]
    })
  }

  // ---------- VERLN (mostrar lista negra) ----------
  else if (command === 'verln') {
    const bannedEntries = Object.entries(db).filter(([_, data]) => data?.banned)
    if (bannedEntries.length === 0)
      return conn.sendMessage(m.chat, { text: `${done} No hay usuarios en la lista negra.` })

    let textList = '🚫 *Lista negra:*\n\n'
    let mentions = []

    for (const [jid, data] of bannedEntries) {
      textList += `• @${jid.split('@')[0]}\n  Motivo: ${data.banReason || 'No especificado'}\n\n`
      mentions.push(jid)
    }

    await conn.sendMessage(m.chat, { text: textList.trim(), mentions })
  }

  // ---------- USLN (vaciar lista negra) ----------
  else if (command === 'usln') {
    for (const jid in db) {
      if (db[jid]?.banned) {
        db[jid].banned = false
        db[jid].banReason = ''
        db[jid].bannedBy = null
      }
    }
    await conn.sendMessage(m.chat, { text: `${done} La lista negra ha sido vaciada.` })
  }

  if (global.db.write) await global.db.write()
}

// ---------- AUTO-KICK SI HABLA ----------
handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.sender) return
  const db = global.db.data.users || {}
  const sender = normalizeJid(m.sender)
  if (db[sender]?.banned) {
    const reason = db[sender].banReason || 'No especificado'
    await conn.sendMessage(m.chat, {
      text: `🚫 @${m.pushName || sender.split('@')[0]} está en la lista negra y será eliminado.\nMotivo: ${reason}`,
      mentions: [sender]
    })
    await new Promise(r => setTimeout(r, 500))
    try {
      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
      console.log(`[AUTO-KICK] Eliminado ${sender}`)
    } catch (e) {
      console.log(`⚠️ No se pudo eliminar a ${sender}: ${e.message}`)
    }
  }
}

// ---------- AUTO-KICK AL UNIRSE ----------
handler.participantsUpdate = async function (event) {
  const conn = this
  const { id, participants, action } = event
  const db = global.db.data.users || {}
  if (action === 'add' || action === 'invite') {
    for (const user of participants) {
      const u = normalizeJid(user)
      if (db[u]?.banned) {
        const reason = db[u].banReason || 'No especificado'
        try {
          await conn.sendMessage(id, {
            text: `🚫 @${(await conn.getName(u)) || u.split('@')[0]} está en la lista negra y será eliminado automáticamente.\nMotivo: ${reason}`,
            mentions: [u]
          })
          await new Promise(r => setTimeout(r, 500))
          await conn.groupParticipantsUpdate(id, [u], 'remove')
          console.log(`[AUTO-KICK JOIN] ${u} eliminado`)
        } catch (e) {
          console.log(`⚠️ No se pudo eliminar a ${u} al unirse: ${e.message}`)
        }
      }
    }
  }
}

handler.help = ['ln', 'unln', 'cln', 'verln', 'usln']
handler.tags = ['owner']
handler.command = ['ln', 'unln', 'cln', 'verln', 'usln']
handler.rowner = true

export default handler
