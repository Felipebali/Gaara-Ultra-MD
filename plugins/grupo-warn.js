// plugins/warn.js
let handler = async (m, { conn, args, isAdmin, isROwner, isBotAdmin }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)
    if (!isAdmin && !isROwner) return conn.reply(m.chat, '❌ Solo administradores pueden advertir.', m)

    // Obtener target: citado, mencionado o número en args
    let target = m.quoted?.sender || m.mentionedJid?.[0] || (args && args[0] ? (args[0].includes('@') ? args[0] : `${args[0].replace(/\D/g,'')}@s.whatsapp.net`) : null)
    if (!target) return conn.reply(m.chat, '❗ Menciona o responde el mensaje del usuario a advertir.', m)

    // Inicializar estructura en DB
    global.db.data = global.db.data || {}
    global.db.data.chats = global.db.data.chats || {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
    const warns = global.db.data.chats[m.chat].warns

    warns[target] = (warns[target] || 0) + 1
    await global.db.write()

    const count = warns[target]
    let name = target.split('@')[0]
    try { name = await conn.getName(target) } catch {}

    // obtener participantes para revisar si target es admin
    let metadata = {}
    try { metadata = await conn.groupMetadata(m.chat) } catch { metadata = { participants: [] } }
    const participants = metadata.participants || []
    const participant = participants.find(p => (p.id || p.jid || p.participant) === target) || {}
    const isTargetAdmin = !!(participant.admin === 'admin' || participant.admin === 'superadmin' || participant.admin === true)

    // Si alcanza 5 advertencias
    if (count >= 5) {
      if (isTargetAdmin) {
        // No expulsar admins: dejarlo en 4 y avisar brevemente
        warns[target] = 4
        await global.db.write()
        return conn.sendMessage(m.chat, { text: `⚠️ ${name} alcanzó 5 advertencias pero es administrador. Contacta a los owners para acciones.` }, { quoted: m })
      }

      // Expulsar usuario no-admin
      if (!isBotAdmin) {
        return conn.sendMessage(m.chat, { text: '⚠️ Necesito ser administrador para expulsar usuarios.' }, { quoted: m })
      }
      try {
        await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
        delete warns[target]
        await global.db.write()
        return conn.sendMessage(m.chat, { text: `✅ ${name} eliminado por alcanzar 5 advertencias.` }, { quoted: m })
      } catch (e) {
        console.error(e)
        return conn.sendMessage(m.chat, { text: '❌ No pude eliminar al usuario. Comprueba permisos.' }, { quoted: m })
      }
    }

    // Notificación mínima cuando no llega a 5
    return conn.sendMessage(m.chat, { text: `⚠️ ${name} tiene ${count}/5 advertencias.`, mentions: [target] }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Ocurrió un error al ejecutar el comando.', m)
  }
}

handler.help = ['warn','advertir']
handler.tags = ['admin']
handler.command = ['warn','advertir']
handler.group = true
handler.admin = true
handler.register = true

export default handler
