// plugins/info-id.js
let handler = async (m, { conn, groupMetadata }) => {
  if (m.mentionedJid?.length) {
    const u = m.mentionedJid[0]
    const name = await conn.getName(u) || 'Usuario'
    const num = u.replace(/@s\.whatsapp\.net$/, '').replace(/[^0-9]/g, '')
    return conn.reply(m.chat, 
`╭─✿ *ID de Usuario* ✿─╮
│ 👤 *Nombre:* ${name}
│ 📱 *Número:* ${num}
│ 🪪 *JID:* ${u}
╰─────────────────────╯`, m, { mentions: [u] })
  }

  if (m.isGroup) {
    const { subject, participants } = groupMetadata
    return conn.reply(m.chat, 
`╭─✿ *ID del Grupo* ✿─╮
│ 🏷️ *Nombre:* ${subject}
│ 🪪 *JID:* ${m.chat}
│ 👥 *Participantes:* ${participants.length}
╰─────────────────────╯`, m)
  }

  conn.reply(m.chat, 
`📋 *Uso del comando ID/LID:*

🏷️ *.id @usuario* → Ver ID de usuario
🏢 *.id* (en grupo) → Ver ID del grupo
📱 *.lid* → Ver lista completa de participantes

💡 Ejemplos:
• .id @juan
• .id
• .lid`, m)
}

// 🧾 Lista completa de participantes
let handlerLid = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  const ps = groupMetadata.participants || []
  const lista = ps.map((p, i) => {
    const j = p.id
    const n = '@' + j.split('@')[0]
    const r = p.admin == 'superadmin' ? '👑 Propietario' : p.admin == 'admin' ? '🛡️ Administrador' : '👤 Miembro'
    return `╭─✿ *Usuario ${i + 1}* ✿
│ ${n}
│ 🪪 ${j}
│ 💠 ${r}
╰───────────────✿`
  }).join('\n\n')

  conn.reply(m.chat, 
`╭━━━❖『 *Lista de Participantes* 』❖━━━╮
👥 *Grupo:* ${groupMetadata.subject}
🔢 *Total:* ${ps.length} miembros
╰━━━━━━━━━━━━━━━━━━━━━━╯

${lista}`, m, { mentions: ps.map(p => p.id).filter(Boolean) })
}

handler.command = ['id']
handler.tags = ['info']

handlerLid.command = ['lid']
handlerLid.tags = ['group']
handlerLid.group = true

export { handler as default, handlerLid }
