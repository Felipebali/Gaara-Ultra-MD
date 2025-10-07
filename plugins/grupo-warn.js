// plugins/grupo-warn.js
let handler = async (m, { conn, isAdmin, isROwner, isBotAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)
  if (!isAdmin && !isROwner) return conn.reply(m.chat, '❌ Solo administradores pueden advertir.', m)

  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return conn.reply(m.chat, '❗ Menciona o responde el mensaje del usuario a advertir.', m)

  // Inicializar estructura del chat si no existe
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
  const warns = global.db.data.chats[m.chat].warns

  // Aumentar advertencias
  warns[target] = (warns[target] || 0) + 1
  await global.db.write()

  const count = warns[target]
  let name
  try {
    name = await conn.getName(target)
  } catch {
    name = target.split('@')[0]
  }

  // Obtener metadata del grupo
  let metadata = {}
  try {
    metadata = await conn.groupMetadata(m.chat)
  } catch {
    metadata = { participants: [] }
  }

  const participants = metadata.participants || []
  const targetData = participants.find(p => p.id === target || p.jid === target || p.participant === target)
  const isTargetAdmin = targetData?.admin === 'admin' || targetData?.admin === 'superadmin' || targetData?.admin === true

  // Mencionar administradores del grupo
  const admins = participants.filter(p => p.admin).map(p => p.id)

  if (count >= 5) {
    if (isTargetAdmin) {
      warns[target] = 4
      await global.db.write()
      return conn.sendMessage(m.chat, {
        text: `⚠️ @${name} alcanzó **5 advertencias**, pero es administrador.\n🔔 Se notifica a los admins.`,
        mentions: [target, ...admins]
      }, { quoted: m })
    }

    if (!isBotAdmin) {
      return conn.sendMessage(m.chat, {
        text: `⚠️ Necesito ser administrador para expulsar usuarios.`,
      }, { quoted: m })
    }

    try {
      await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
      delete warns[target]
      await global.db.write()
      return conn.sendMessage(m.chat, {
        text: `✅ @${name} fue eliminado por alcanzar **5 advertencias**.`,
        mentions: [target, ...admins]
      }, { quoted: m })
    } catch (e) {
      console.error(e)
      return conn.sendMessage(m.chat, {
        text: `❌ No pude eliminar al usuario. Comprueba mis permisos.`,
      }, { quoted: m })
    }
  } else {
    return conn.sendMessage(m.chat, {
      text: `⚠️ @${name} tiene ${count}/5 advertencias.`,
      mentions: [target, ...admins]
    }, { quoted: m })
  }
}

handler.help = ['warn', 'advertir']
handler.tags = ['admin']
handler.command = ['warn', 'advertir']
handler.group = true
handler.admin = true
handler.register = true

export default handler
