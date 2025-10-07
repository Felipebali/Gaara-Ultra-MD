// plugins/warn.js
let handler = async (m, { conn, isAdmin, isROwner, isBotAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)
  if (!isAdmin && !isROwner) return conn.reply(m.chat, '❌ Solo administradores pueden advertir.', m)

  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return conn.reply(m.chat, '❗ Menciona o responde el mensaje del usuario a advertir.', m)

  // init estructura
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
  const warns = global.db.data.chats[m.chat].warns

  warns[target] = (warns[target] || 0) + 1
  await global.db.write()

  const count = warns[target]
  const name = await conn.getName(target).catch(()=> target.split('@')[0])

  // obtener participantes para verificar si target es admin
  let metadata = {}
  try { metadata = await conn.groupMetadata(m.chat) } catch(e) { metadata = { participants: [] } }
  const participants = metadata.participants || []
  const tp = participants.find(p => p.id === target || p.jid === target || p.participant === target) || {}
  const isTargetAdmin = !!(tp.admin === 'admin' || tp.admin === 'superadmin' || tp.admin === true)

  if (count >= 5) {
    if (isTargetAdmin) {
      // no expulsar admins: avisar y dejar en 4 para no reiniciar el bucle
      warns[target] = 4
      await global.db.write()
      return conn.sendMessage(m.chat, { text: `⚠️ ${name} alcanzó 5 advertencias pero es administrador. Contacta a los owners para acciones.` }, { quoted: m })
    }
    // intentar expulsar
    if (!isBotAdmin) {
      return conn.sendMessage(m.chat, { text: `⚠️ Necesito ser administrador para expulsar usuarios.` }, { quoted: m })
    }
    try {
      await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
      delete warns[target]
      await global.db.write()
      // notificación breve (minimal)
      return conn.sendMessage(m.chat, { text: `✅ Usuario eliminado por alcanzar 5 advertencias.` }, { quoted: m })
    } catch (e) {
      console.error(e)
      return conn.sendMessage(m.chat, { text: `❌ No pude eliminar al usuario. Comprueba permisos.` }, { quoted: m })
    }
  } else {
    // notificación mínima
    return conn.sendMessage(m.chat, { text: `⚠️ ${name} tiene ${count}/5 advertencias.`, mentions: [target] }, { quoted: m })
  }
}

handler.help = ['warn','advertir']
handler.tags = ['admin']
handler.command = ['warn','advertir']
handler.group = true
handler.admin = true
handler.register = true

export default handler
