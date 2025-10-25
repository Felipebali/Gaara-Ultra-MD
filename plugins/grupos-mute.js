// plugins/mute.js
function normalizeJid(jid) {
  if (!jid) return null
  // Si viene como objeto o con parámetros extra, convertir a string
  jid = String(jid)
  // Quitar espacios
  jid = jid.trim()
  // Si es un número suelto (ej: 59891234567) convertirlo a JID
  const onlyDigits = jid.replace(/\D/g, '')
  if (/^\d{5,}$/.test(onlyDigits) && !jid.includes('@')) {
    return `${onlyDigits}@s.whatsapp.net`
  }
  // sustituir @c.us por @s.whatsapp.net y normalizar
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

let mutedUsers = new Set()

let handler = async (m, { conn, usedPrefix, command, isAdmin, isBotAdmin }) => {
  if (!isBotAdmin) return conn.reply(m.chat, '⭐ El bot necesita ser administrador.', m)
  if (!isAdmin) return conn.reply(m.chat, '⭐ Solo los administradores pueden usar este comando.', m)

  let userJid = null

  // 1) si citó mensaje
  if (m.quoted && m.quoted.sender) userJid = normalizeJid(m.quoted.sender)
  // 2) si mencionó
  else if (m.mentionedJid && m.mentionedJid.length > 0) userJid = normalizeJid(m.mentionedJid[0])
  // 3) si escribió un número en el texto
  else if (m.text) {
    const num = m.text.match(/\d{5,}/)?.[0]
    if (num) userJid = normalizeJid(num)
  }

  if (!userJid) return conn.reply(m.chat, '😮‍💨 Debes citar, mencionar o escribir el número del usuario para mutear/desmutear.', m)

  if (["mute", "silenciar"].includes(command)) {
    mutedUsers.add(userJid)
    await conn.reply(m.chat, `✅ *Usuario muteado:* @${userJid.split('@')[0]}`, m, { mentions: [userJid] })
  } else if (["unmute", "desilenciar"].includes(command)) {
    if (!mutedUsers.has(userJid))
      return conn.reply(m.chat, `⚠️ @${userJid.split('@')[0]} no está muteado.`, m, { mentions: [userJid] })

    mutedUsers.delete(userJid)
    await conn.reply(m.chat, `✅ *Usuario desmuteado:* @${userJid.split('@')[0]}`, m, { mentions: [userJid] })
  }
}

// Antes de procesar mensajes: eliminar si el remitente está muteado
handler.before = async (m, { conn }) => {
  try {
    const sender = normalizeJid(m.sender)
    if (!sender) return
    if (mutedUsers.has(sender)) {
      // intentar borrar el mensaje
      try {
        await conn.sendMessage(m.chat, { delete: m.key })
      } catch (e) {
        // si no se puede borrar, enviar aviso silencioso (opcional)
        console.error('No se pudo eliminar mensaje muteado:', e?.message || e)
      }
      // bloquear más procesamiento (si tu framework lo usa así)
      return true
    }
  } catch (e) {
    console.error(e)
  }
}

handler.help = ['mute', 'unmute', 'silenciar', 'desilenciar']
handler.tags = ['grupo']
handler.command = ['mute', 'unmute', 'silenciar', 'desilenciar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
