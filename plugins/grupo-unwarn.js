// plugins/unwarn.js
let handler = async (m, { conn, args, isAdmin, isROwner }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)
    if (!isAdmin && !isROwner) return conn.reply(m.chat, '❌ Solo administradores pueden usar esto.', m)

    let target = m.quoted?.sender || m.mentionedJid?.[0] || (args && args[0] ? (args[0].includes('@') ? args[0] : `${args[0].replace(/\D/g,'')}@s.whatsapp.net`) : null)
    if (!target) return conn.reply(m.chat, '❗ Menciona o responde el mensaje del usuario a desadvertir.', m)

    global.db.data = global.db.data || {}
    global.db.data.chats = global.db.data.chats || {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.chats[m.chat].warns) global.db.data.chats[m.chat].warns = {}
    const warns = global.db.data.chats[m.chat].warns

    if (!warns[target]) return conn.sendMessage(m.chat, { text: 'ℹ️ El usuario no tiene advertencias.' }, { quoted: m })

    // Si se pasa argumento "reset" o "0" -> eliminar todas
    if (args && (args[0] === 'reset' || args[0] === '0')) {
      delete warns[target]
      await global.db.write()
      return conn.sendMessage(m.chat, { text: '✅ Advertencias reseteadas para el usuario.' }, { quoted: m })
    }

    // Sino, quitar 1
    warns[target] = Math.max(0, (warns[target] || 0) - 1)
    if (warns[target] === 0) delete warns[target]
    await global.db.write()
    let name = target.split('@')[0]
    try { name = await conn.getName(target) } catch {}
    return conn.sendMessage(m.chat, { text: `✅ Se quitó una advertencia a ${name}. Ahora tiene ${warns[target] || 0}/5.` }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Ocurrió un error.', m)
  }
}

handler.help = ['unwarn','quitarwarn']
handler.tags = ['admin']
handler.command = ['unwarn','quitarwarn','deswarn','desadvertir']
handler.group = true
handler.admin = true
handler.register = true

export default handler
