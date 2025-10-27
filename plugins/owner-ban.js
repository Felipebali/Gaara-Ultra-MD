// plugins/propietario-ln.js
function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫'
  const done = '✅'
  // Aquí usamos global.db.data.users como "db" de la lista negra (compatibilidad con el resto del bot)
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.users) global.db.data.users = {}
  const db = global.db.data.users

  // Reacciones por comando
  const reactions = { ln: '✅', unln: '☢️', cln: '👀', verln: '📜', usln: '🧹' }
  if (reactions[command]) {
    try {
      await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })
    } catch (e) { /* no crítico */ }
  }

  // Detectar usuario objetivo
  let userJid = null
  if (m.quoted) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (text) {
    const num = text.match(/\d{5,}/)?.[0]
    if (num) userJid = `${num}@s.whatsapp.net`
  }

  // Motivo (elimina número o mención)
  let reason = text ? text.replace(/@/g, '').replace(userJid?.split('@')[0] || '', '').trim() : ''
  if (!reason) reason = 'No especificado'

  if (!userJid && !['verln', 'usln'].includes(command))
    return conn.reply(m.chat, `${emoji} Debes responder, mencionar o escribir el número del usuario.`, m)

  if (userJid && !db[userJid]) db[userJid] = {}

  // --- AGREGAR A LISTA NEGRA ---
  if (command === 'ln') {
    db[userJid].banned = true
    db[userJid].banReason = reason
    db[userJid].bannedBy = m.sender

    await conn.sendMessage(m.chat, {
      text: `${done} @${userJid.split('@')[0]} fue agregado a la lista negra.\n📝 Motivo: ${reason}`,
      mentions: [userJid]
    })

    // Expulsar de todos los grupos donde esté
    try {
      // groupFetchAllParticipating puede devolver un objeto { jid: { ... } } o similar
      const all = await conn.groupFetchAllParticipating()
      const groupIds = Array.isArray(all) ? all.map(g => g.id) : Object.keys(all || {})
      const isSame = (a, b) => ('' + (a || '')).replace(/\D/g, '') === ('' + (b || '')).replace(/\D/g, '')

      for (const jid of groupIds) {
        try {
          // Traer metadata actualizada (incluye participantes)
          const group = await conn.groupMetadata(jid)
          // participants puede ser array o un objeto según la versión; lo normal es array
          const participants = Array.isArray(group.participants) ? group.participants : Object.values(group.participants || {})
          const member = participants.find(p => isSame(p.id, userJid))
          if (!member) continue

          // Proteger owners y al propio bot
          const protectedNums = ['59898719147', '59896026646', (conn.user && conn.user.jid) ? conn.user.jid.split('@')[0] : null].filter(Boolean)
          if (protectedNums.includes(userJid.split('@')[0])) {
            console.log(`[PROTEGIDO] No se puede expulsar a ${userJid}`)
            continue
          }

          await conn.sendMessage(jid, {
            text: `🚫 @${userJid.split('@')[0]} está en la lista negra y será eliminado automáticamente.\n📝 Motivo: ${reason}`,
            mentions: [userJid]
          })
          await new Promise(r => setTimeout(r, 500))

          // Intentar expulsar usando el id tal cual
          try {
            await conn.groupParticipantsUpdate(jid, [member.id], 'remove')
            console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject || jid}`)
          } catch (removeErr) {
            // En algunos casos el id debe normalizarse o usarse jid limpio
            try {
              await conn.groupParticipantsUpdate(jid, [normalizeJid(userJid)], 'remove')
              console.log(`[AUTO-KICK] Expulsado (alt) ${userJid} de ${group.subject || jid}`)
            } catch (e2) {
              console.log(`⚠️ No se pudo expulsar de ${group.subject || jid}: ${removeErr.message} / ${e2?.message || 'second attempt failed'}`)
            }
          }
        } catch (e) {
          console.log(`⚠️ Error procesando grupo ${jid}: ${e.message}`)
        }
      }
    } catch (e) {
      console.log('⚠️ Error al obtener grupos para auto-kick:', e.message)
    }
  }

  // --- QUITAR DE LISTA NEGRA ---
  else if (command === 'unln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, {
        text: `${emoji} @${userJid.split('@')[0]} no está en la lista negra.`,
        mentions: [userJid]
      })

    db[userJid].banned = false
    db[userJid].banReason = ''
    db[userJid].bannedBy = null

    await conn.sendMessage(m.chat, {
      text: `${done} @${userJid.split('@')[0]} fue eliminado de la lista negra.`,
      mentions: [userJid]
    })
  }

  // --- CONSULTAR ESTADO ---
  else if (command === 'cln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, {
        text: `✅ @${userJid.split('@')[0]} no está en la lista negra.`,
        mentions: [userJid]
      })

    await conn.sendMessage(m.chat, {
      text: `${emoji} @${userJid.split('@')[0]} está en la lista negra.\n📝 Motivo: ${db[userJid].banReason || 'No especificado'}`,
      mentions: [userJid]
    })
  }

  // --- VER LISTA COMPLETA ---
  else if (command === 'verln') {
    const bannedUsers = Object.entries(db).filter(([_, data]) => data?.banned)
    if (bannedUsers.length === 0)
      return conn.sendMessage(m.chat, { text: `${done} No hay usuarios en la lista negra.` })

    let list = '🚫 *Lista negra actual:*\n\n'
    const mentions = []

    for (const [jid, data] of bannedUsers) {
      list += `• @${jid.split('@')[0]}\n  Motivo: ${data.banReason || 'No especificado'}\n\n`
      mentions.push(jid)
    }

    await conn.sendMessage(m.chat, { text: list.trim(), mentions })
  }

  // --- VACIAR LISTA ---
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

  // Guardar DB si existe escritura (dependiendo de tu implementación)
  if (global.db && global.db.write) try { await global.db.write() } catch (e) { console.log('⚠️ Error guardando DB:', e.message) }
}

// --- AUTO-KICK SI HABLA ---
handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.sender) return
  if (!global.db) return
  const db = global.db.data.users || {}
  const sender = normalizeJid(m.sender)
  if (db[sender]?.banned) {
    const reason = db[sender].banReason || 'No especificado'
    try {
      await conn.sendMessage(m.chat, {
        text: `🚫 @${sender.split('@')[0]} está en la lista negra y será eliminado.\n📝 Motivo: ${reason}`,
        mentions: [sender]
      })
      await new Promise(r => setTimeout(r, 500))

      // Proteger owners y bot
      const protectedNums = ['59898719147', '59896026646', (conn.user && conn.user.jid) ? conn.user.jid.split('@')[0] : null].filter(Boolean)
      if (protectedNums.includes(sender.split('@')[0])) {
        console.log(`[PROTEGIDO] No se puede expulsar a ${sender}`)
        return
      }

      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
      console.log(`[AUTO-KICK] Eliminado ${sender} en ${m.chat}`)
    } catch (e) {
      console.log(`⚠️ No se pudo eliminar a ${sender}: ${e.message}`)
    }
  }
}

// --- AUTO-KICK AL UNIRSE ---
handler.participantsUpdate = async function (event) {
  const conn = this
  const { id, participants, action } = event
  if (!global.db) return
  const db = global.db.data.users || {}
  if (action === 'add' || action === 'invite') {
    for (const user of participants) {
      const u = normalizeJid(user)
      if (db[u]?.banned) {
        const reason = db[u].banReason || 'No especificado'
        try {
          await conn.sendMessage(id, {
            text: `🚫 @${u.split('@')[0]} está en la lista negra y será eliminado automáticamente.\n📝 Motivo: ${reason}`,
            mentions: [u]
          })
          await new Promise(r => setTimeout(r, 500))

          const protectedNums = ['59898719147', '59896026646', (conn.user && conn.user.jid) ? conn.user.jid.split('@')[0] : null].filter(Boolean)
          if (protectedNums.includes(u.split('@')[0])) {
            console.log(`[PROTEGIDO] No se puede expulsar a ${u}`)
            continue
          }

          await conn.groupParticipantsUpdate(id, [u], 'remove')
          console.log(`[AUTO-KICK JOIN] ${u} eliminado en ${id}`)
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
