// plugins/grupo-warn.js
const handler = async (m, { conn, text, usedPrefix, command, groupMetadata, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Solo en grupos.' }, { quoted: m })
  if (!isAdmin) return conn.sendMessage(m.chat, { text: '❌ Solo admins pueden advertir.' }, { quoted: m })
  if (!isBotAdmin) return conn.sendMessage(m.chat, { text: '❌ Necesito ser admin para eliminar usuarios.' }, { quoted: m })

  const user = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender)
  if (!user) return conn.sendMessage(m.chat, { text: `❗ Menciona a alguien.\nEj: *${usedPrefix}${command} @usuario razón*` }, { quoted: m })
  const reason = text.split(" ").slice(1).join(" ")
  if (!reason) return conn.sendMessage(m.chat, { text: '❗ Debes escribir el motivo de la advertencia.' }, { quoted: m })

  // inicializar warn
  const chatData = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  chatData.warns = chatData.warns || {}

  const current = chatData.warns[user] || { count: 0, date: null }
  const newCount = current.count + 1
  const date = new Date().toLocaleDateString('es-ES')

  chatData.warns[user] = { count: newCount, date, jid: user }
  await global.db.write()

  const senderName = conn.getName(m.sender)
  const userName = conn.getName(user)

  if (newCount >= 5) {
    // eliminar usuario si no es admin
    const participants = (groupMetadata?.participants || [])
    const targetData = participants.find(p => p.id === user)
    const isTargetAdmin = targetData?.admin === 'admin' || targetData?.admin === 'superadmin'

    if (isTargetAdmin) {
      chatData.warns[user].count = 4
      await global.db.write()
      return conn.sendMessage(m.chat, { text: `⚠️ ${userName} alcanzó 5 advertencias pero es admin. Notifica a los owners.` }, { quoted: m })
    }

    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      delete chatData.warns[user]
      await global.db.write()
      return conn.sendMessage(m.chat, { text: `✅ ${userName} eliminado por alcanzar 5 advertencias.` }, { quoted: m })
    } catch {
      return conn.sendMessage(m.chat, { text: '❌ No pude eliminar al usuario. Revisa mis permisos.' }, { quoted: m })
    }
  } else {
    return conn.sendMessage(m.chat, { text: `⚠️ ${userName} tiene ${newCount}/5 advertencias.\nMotivo: ${reason}`, mentions: [user] }, { quoted: m })
  }
}

handler.command = ['warn','advertir','ad','daradvertencia']
handler.tags = ['admin']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
