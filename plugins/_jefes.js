const ownerNumbers = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net'] // 👑 Dueños del bot

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('🐾 Este comando solo funciona en grupos.')

  const admins = participants.filter(p => p.admin)

  // Dueños dentro del grupo (aunque no sean admins)
  const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id))
  const ownerMentions = ownersInGroup.map(o => `🔥 @${o.id.split('@')[0]} (El Gran Felino)`)

  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id))

  // Frases nuevas y divertidas
  const frasesDueños = [
    '🐾 Aquí los verdaderos reyes del teclado.',
    '😼 Su mirada controla cada mensaje enviado.',
    '⚡ Los hilos digitales del grupo están bajo su poder.',
    '🦾 Cada admin se inclina ante su supremacía felina.',
    '🌌 Su sabiduría hace temblar hasta a los stickers más traviesos.'
  ]
  const fraseAleatoria = frasesDueños[Math.floor(Math.random() * frasesDueños.length)]

  let texto = `👑 *LOS JEFES SUPREMOS DE ESTE GRUPO* 👑\n\n`

  if (ownersInGroup.length > 0) {
    texto += `💫 *DUEÑ@ DEL BOT:*\n`
    texto += ownerMentions.join('\n')
    texto += `\n\n"${fraseAleatoria}"\n\n`
  } else {
    texto += `😺 *El Gran Jefe aún no está en este grupo... pero nos vigila desde las sombras.* 🐾\n\n`
  }

  texto += `⚡ *ADMINISTRADORES FELINOS:*\n`
  texto += otherAdmins.map((a, i) => `${i + 1}. @${a.id.split('@')[0]}`).join('\n') || 'Ninguno 😹'
  texto += `\n\n🐱 *Respeten a los jefes o serán arañados por el poder que me conlleva.* 😼`

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [...admins.map(a => a.id), ...ownersInGroup.map(o => o.id)]
  }, { quoted: m })
}

handler.command = ['jefes']
handler.tags = ['group']
handler.help = ['jefes']
handler.group = true

export default handler
