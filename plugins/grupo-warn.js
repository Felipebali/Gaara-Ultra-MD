// plugins/grupo-warn.js
const handler = async (m, { conn, isAdmin, isROwner, isBotAdmin, groupMetadata }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!isAdmin && !isROwner) return m.reply('❌ Solo los administradores pueden advertir.')

  // Obtener objetivo: mencionado o mensaje citado
  const target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return m.reply('❗ Menciona o responde al mensaje del usuario que quieres advertir.')

  // Inicializar advertencias
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
  const warns = global.db.data.chats[m.chat].warns

  warns[target] = (warns[target] || 0) + 1
  const count = warns[target]

  // Nombre seguro sin promesas
  const targetName = conn.getName ? conn.getName(target) : target.split('@')[0]

  // Obtener participantes y verificar si target es admin
  const participants = (groupMetadata?.participants || [])
  const targetData = participants.find(p => p.id === target || p.jid === target || p.participant === target)
  const isTargetAdmin = targetData?.admin === 'admin' || targetData?.admin === 'superadmin' || targetData?.admin === true

  // Eliminar usuario al llegar a 5 advertencias
  if (count >= 5) {
    if (isTargetAdmin) {
      warns[target] = 4
      return conn.sendMessage(m.chat, { text: `⚠️ ${targetName} alcanzó 5 advertencias, pero es admin. Contacta a los owners.` })
    }

    if (!isBotAdmin) return conn.sendMessage(m.chat, { text: '⚠️ Necesito ser admin para expulsar usuarios.' })

    try {
      await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
      delete warns[target]
      await global.db.write()
      return conn.sendMessage(m.chat, { text: `✅ ${targetName} fue eliminado por alcanzar 5 advertencias.` })
    } catch (e) {
      console.error(e)
      return conn.sendMessage(m.chat, { text: '❌ No pude eliminar al usuario. Comprueba mis permisos.' })
    }
  }

  await global.db.write()
  return conn.sendMessage(m.chat, { text: `⚠️ ${targetName} tiene ${count}/5 advertencias.` })
}

handler.help = ['warn', 'advertir']
handler.tags = ['admin']
handler.command = ['warn', 'advertir']
handler.group = true
handler.admin = true
handler.register = true

export default handler
