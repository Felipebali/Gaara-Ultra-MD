// 📂 plugins/jefes.js
const ownerNumbers = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net'] // 👑 DUEÑOS DEL BOT

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('🐾 Este comando solo funciona en grupos, minino.')

  const admins = participants.filter(p => p.admin)
  if (!admins.length) return m.reply('😿 No hay administradores en este grupo.')

  const ownerInGroup = admins.filter(a => ownerNumbers.includes(a.id))
  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id))

  let texto = `👑 *LOS JEFES SUPREMOS DE ESTE GRUPO* 👑\n\n`

  if (ownerInGroup.length > 0) {
    texto += `💫 *DUEÑ@ DEL BOT:*\n`
    texto += ownerInGroup.map(a => `🔥 @${a.id.split('@')[0]} (El Gran Felino)`).join('\n')
    texto += '\n\n'
  }

  texto += `⚡ *ADMINISTRADORES FELINOS:*\n`
  texto += otherAdmins.map((a, i) => `${i + 1}. @${a.id.split('@')[0]}`).join('\n')
  texto += `\n\n🐱 *Respeten a los jefes o serán arañados por el poder felino.* 😼`

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: admins.map(a => a.id)
  }, { quoted: m })
}

handler.command = ['jefes']
handler.tags = ['group']
handler.help = ['jefes']
handler.group = true

export default handler
