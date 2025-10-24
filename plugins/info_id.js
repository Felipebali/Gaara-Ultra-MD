// plugins/info-id.js
let handler = async (m, { conn, groupMetadata }) => {
  const u = m.mentionedJid?.[0] || m.quoted?.sender
  if (u && u.endsWith('@s.whatsapp.net')) {
    const name = await conn.getName(u) || 'Usuario'
    const num = u.split('@')[0]
    return conn.reply(m.chat, 
`╭─✿ *ID de Usuario* ✿─╮
│ 👤 *Nombre:* ${name}
│ 📱 *Número:* ${num}
│ 🪪 *JID:* ${u}
╰─────────────────────╯`, m, { mentions: [u] })
  }

  if (m.isGroup && groupMetadata) {
    const { subject, participants } = groupMetadata
    return conn.reply(m.chat, 
`╭─✿ *ID del Grupo* ✿─╮
│ 🏷️ *Nombre:* ${subject}
│ 🪪 *JID:* ${m.chat}
│ 👥 *Participantes:* ${participants.length}
╰─────────────────────╯`, m)
  }

  return conn.reply(m.chat, 
`📋 *Uso del comando ID/LID:*

🏷️ *.id @usuario* → Ver ID de usuario
🏢 *.id* (en grupo) → Ver ID del grupo
📱 *.lid* → Ver lista completa de participantes

💡 Ejemplos:
• .id @juan
• .id
• .lid`, m)
}

let handlerLid = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup || !groupMetadata) return m.reply('❌ Este comando solo funciona en grupos.')

  const participantes = groupMetadata.participants || []
  const contenido = participantes.map((p, i) => {
    const jid = p.id
    const num = jid.split('@')[0]
    const rol = p.admin === 'superadmin' ? '👑 Propietario' :
                p.admin === 'admin' ? '🛡️ Administrador' : '👤 Miembro'
    return `╭─✿ *Usuario ${i+1}* ✿
│ 📱 Número: ${num}
│ 🪪 JID: ${jid}
│ 🛡️ Rol: ${rol}
╰───────────────✿`
  }).join('\n\n')

  const menciones = participantes.map(p => p.id)
  return conn.reply(m.chat, `╭━━━❖『 Lista de Participantes 』❖━━━╮
👥 Grupo: ${groupMetadata.subject}
🔢 Total: ${participantes.length} miembros
╰━━━━━━━━━━━━━━━━━━━━━━╯

${contenido}`, m, { mentions: menciones })
}

handler.command = ['id']
handler.help = ['id', 'id @usuario']
handler.tags = ['info']

handlerLid.command = ['lid']
handlerLid.help = ['lid']
handlerLid.tags = ['group']
handlerLid.group = true

export { handler as default, handlerLid }
