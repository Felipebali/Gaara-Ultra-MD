// plugins/info-id.js
let handler = async (m, { conn, groupMetadata }) => {
  // Usuario mencionado o citado
  const u = m.mentionedJid?.[0] || m.quoted?.sender
  if (u && u.endsWith('@s.whatsapp.net')) {
    const name = await conn.getName(u) || 'Usuario'
    const num = u.split('@')[0] // solo el número real
    return conn.reply(m.chat, 
`╭─✿ *ID de Usuario* ✿─╮
│ 👤 *Nombre:* ${name}
│ 📱 *Número:* ${num}
│ 🪪 *JID:* ${u}
╰─────────────────────╯`, m, { mentions: [u] })
  }

  // Si es grupo y no hay usuario mencionado
  if (m.isGroup) {
    const { subject, participants } = groupMetadata
    return conn.reply(m.chat, 
`╭─✿ *ID del Grupo* ✿─╮
│ 🏷️ *Nombre:* ${subject}
│ 🪪 *JID:* ${m.chat}
│ 👥 *Participantes:* ${participants.length}
╰─────────────────────╯`, m)
  }

  // Si no hay usuario ni grupo, mostrar ayuda
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
