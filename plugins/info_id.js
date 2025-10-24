// plugins/info-id.js
let handler = async (m, { conn, groupMetadata }) => {
  if (m.mentionedJid?.length) {
    const u = m.mentionedJid[0]
    const name = await conn.getName(u) || 'Usuario'
    const num = u.split('@')[0]
    return conn.reply(m.chat, `╭─✿ *ID de Usuario* ✿─╮\n│ 👤 *Nombre:* ${name}\n│ 📱 *Número:* ${num}\n│ 🪪 *JID:* ${u}\n╰─────────────────────╯`, m, { mentions: [u] })
  }

  if (m.isGroup) {
    const { subject, participants } = groupMetadata
    return conn.reply(m.chat, `╭─✿ *ID del Grupo* ✿─╮\n│ 🏷️ *Nombre:* ${subject}\n│ 🪪 *JID:* ${m.chat}\n│ 👥 *Participantes:* ${participants.length}\n╰─────────────────────╯`, m)
  }

  conn.reply(m.chat, `📋 *Uso del comando ID/LID:*\n\n🏷️ *.id @usuario* → Ver ID de usuario\n🏢 *.id* (en grupo) → Ver ID del grupo\n📱 *.lid* → Ver lista completa de participantes\n\n💡 Ejemplos:\n• .id @juan\n• .id\n• .lid`, m)
}

// 🧾 Lista completa
let handlerLid = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  const ps = groupMetadata.participants || []
  const lista = ps.map((p, i) => {
    const j = p.id, n = '@' + j.split('@')[0]
    const r = p.admin == 'superadmin' ? '👑 Propietario' : p.admin == 'admin' ? '🛡️ Administrador' : '👤 Miembro'
    return `╭─✿ *Usuario ${i + 1}* ✿\n│ ${n}\n│ 🪪 ${j}\n│ 💠 ${r}\n╰───────────────✿`
  }).join('\n\n')
  conn.reply(m.chat, `╭━━━❖『 *Lista de Participantes* 』❖━━━╮\n👥 *Grupo:* ${groupMetadata.subject}\n🔢 *Total:* ${ps.length} miembros\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n${lista}`, m, { mentions: ps.map(p => p.id).filter(Boolean) })
}

handler.command = ['id']
handler.tags = ['info']

handlerLid.command = ['lid']
handlerLid.tags = ['group']
handlerLid.group = true

export { handler as default, handlerLid }
