// plugins/antispam.js
const MAX_SPAM = 5        // Mensajes permitidos seguidos
const TIME_WINDOW = 7000  // Tiempo (ms) para contar los mensajes (7 segundos)
const COOLDOWN = 15000    // Tiempo (ms) de reinicio tras acción (15 seg)

let spamTracker = {}      // Registro temporal

const handler = async (m, { conn }) => {
  if (!m.isGroup || !m.sender || m.key.fromMe) return
  const sender = m.sender
  const chatId = m.chat

  // Crear registro si no existe
  if (!spamTracker[chatId]) spamTracker[chatId] = {}
  if (!spamTracker[chatId][sender]) {
    spamTracker[chatId][sender] = { count: 0, last: Date.now(), timeout: null }
  }

  const userData = spamTracker[chatId][sender]
  const now = Date.now()

  // Si el usuario vuelve a escribir dentro del tiempo de ventana
  if (now - userData.last < TIME_WINDOW) {
    userData.count++
  } else {
    userData.count = 1
  }

  userData.last = now

  // Si supera el límite
  if (userData.count >= MAX_SPAM) {
    await conn.sendMessage(chatId, { react: { text: '⚡', key: m.key } })

    await conn.sendMessage(chatId, {
      text: `❌ _*Límite de spam alcanzado*_ ⚡️\n@${sender.split('@')[0]} será expulsado por spam.`,
      mentions: [sender]
    })

    await new Promise(r => setTimeout(r, 800))

    try {
      await conn.groupParticipantsUpdate(chatId, [sender], 'remove')
      console.log(`[ANTISPAM] ${sender} expulsado por spam en ${chatId}`)
    } catch (e) {
      if (e.message.includes('not-admin')) {
        await conn.sendMessage(chatId, {
          text: `⚠️ No puedo expulsar a @${sender.split('@')[0]} porque *no soy admin*.`,
          mentions: [sender]
        })
      } else {
        console.log(`⚠️ No se pudo eliminar a ${sender}: ${e.message}`)
      }
    }

    // Reiniciar contador
    userData.count = 0
    clearTimeout(userData.timeout)
    userData.timeout = setTimeout(() => delete spamTracker[chatId][sender], COOLDOWN)
  }
}

handler.help = ['antispam']
handler.tags = ['group']
handler.group = true

export default handler
