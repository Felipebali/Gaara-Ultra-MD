// plugins/grupo-warn.js
let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)

  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants || []

  const sender = m.sender
  const isBotAdmin = participants.find(p => p.id === conn.user.jid)?.admin
  const isAdmin = participants.find(p => p.id === sender)?.admin
  const isROwner = global.owner?.includes(sender.split('@')[0])

  if (!isAdmin && !isROwner)
    return conn.reply(m.chat, '❌ Solo administradores pueden advertir.', m)

  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return conn.reply(m.chat, '❗ Menciona o responde el mensaje del usuario a advertir.', m)

  // Inicializar base
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
  const warns = global.db.data.chats[m.chat].warns

  // Incrementar advertencias
  warns[target] = (warns[target] || 0) + 1
  await global.db.write()

  const count = warns[target]
  let name
  try {
    name = await conn.getName(target)
  } catch {
    name = target.split('@')[0]
  }

  // Verificar si el usuario advertido es admin
  const targetData = participants.find(p => p.id === target)
  const isTargetAdmin = targetData?.admin

  // Listar administradores para mencionar
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

    if (!isBotAdmin)
      return conn.sendMessage(m.chat, { text: `⚠️ Necesito ser administrador para expulsar usuarios.` }, { quoted: m })

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
