// 🎮 Adivinanzas estilo Gaara-Ultra-MD / FelixCat 😼

const adivinanzas = [
  { pregunta: '🌕 ¿Qué cosa cuanto más grande menos se ve?', respuesta: 'oscuridad' },
  { pregunta: '🦴 ¿Qué se rompe sin tocarlo?', respuesta: 'silencio' },
  { pregunta: '🔥 ¿Qué sube y nunca baja?', respuesta: 'edad' },
  { pregunta: '🌧️ ¿Qué cae sin mojarse?', respuesta: 'sombra' },
  { pregunta: '🦉 ¿Qué tiene ojos y no ve?', respuesta: 'aguja' },
  { pregunta: '🌳 ¿Qué tiene hojas pero no es un árbol?', respuesta: 'libro' },
  { pregunta: '🔥 Cuanto más le quitas, más grande se hace. ¿Qué es?', respuesta: 'agujero' },
  { pregunta: '💧 Si me nombras, desaparezco. ¿Qué soy?', respuesta: 'silencio' },
  { pregunta: '🌬️ Vuelo sin alas, lloro sin ojos. ¿Qué soy?', respuesta: 'nube' },
  { pregunta: '💡 Cuanto más me usas, más pequeño soy. ¿Qué soy?', respuesta: 'lápiz' },
  { pregunta: '🐍 Tengo dientes pero no muerdo. ¿Qué soy?', respuesta: 'peine' },
  { pregunta: '🕒 Siempre va pero nunca llega. ¿Qué es?', respuesta: 'reloj' },
  { pregunta: '🪞 Me miras y no soy tú. ¿Qué soy?', respuesta: 'espejo' },
  { pregunta: '🐾 Cuatro patas arriba, cuatro patas abajo, en medio un suave colchón. ¿Qué soy?', respuesta: 'cama' },
  { pregunta: '🦷 Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera. ¿Qué es?', respuesta: 'pera' },
  { pregunta: '🌞 Sale de noche y se esconde de día. ¿Qué es?', respuesta: 'estrella' },
  { pregunta: '🚿 Cuanto más lavo, más sucio me pongo. ¿Qué soy?', respuesta: 'agua' },
  { pregunta: '👂 Entra duro y grande y sale blando y pequeño. ¿Qué es?', respuesta: 'chicle' },
  { pregunta: '🎩 Si me dejas me rompo, si me rompes funciono. ¿Qué soy?', respuesta: 'huevo' },
  { pregunta: '🪄 Me puedes ver en el agua, pero nunca me mojo. ¿Qué soy?', respuesta: 'reflejo' }
]

global.juegosActivos = global.juegosActivos || {}
let partidas = {} // almacena partidas activas por chat

const handler = async (m, { conn, usedPrefix }) => {
  const chat = m.chat
  const user = m.sender

  if (!m.isGroup) return m.reply('❌ Este comando solo puede usarse en grupos.')
  if (!global.juegosActivos[chat]) return m.reply(`🎮 Los juegos están desactivados.\nActívalos con *${usedPrefix}juegos on*`)

  if (partidas[chat]) return m.reply('⚠️ Ya hay una adivinanza activa. Espera que termine ⏳')

  const adiv = adivinanzas[Math.floor(Math.random() * adivinanzas.length)]
  partidas[chat] = {
    pregunta: adiv.pregunta,
    respuesta: adiv.respuesta.toLowerCase(),
    activo: true,
    jugador: null
  }

  const msg = `
🎯 *Adivinanza FelixCat* 🐾
────────────────────
❓ ${adiv.pregunta}

⌛ *Tienes 30 segundos para responder.*
(Escribe la respuesta directamente en el chat)
────────────────────`

  await conn.sendMessage(chat, { text: msg }, { quoted: m })

  // Tiempo límite
  setTimeout(() => {
    if (partidas[chat]?.activo) {
      conn.sendMessage(chat, { text: `⏰ *Tiempo terminado.*\nLa respuesta era: *${adiv.respuesta}* 😺` })
      delete partidas[chat]
    }
  }, 30000)
}

// Detectar respuestas
handler.before = async (m, { conn }) => {
  const chat = m.chat
  if (!partidas[chat] || !partidas[chat].activo) return

  const texto = m.text?.trim().toLowerCase()
  if (!texto) return

  const partida = partidas[chat]
  if (texto === partida.respuesta) {
    partida.activo = false
    await conn.sendMessage(chat, {
      text: `🎉 ¡Correcto, *${m.pushName}*! Era *${partida.respuesta}* 😺`
    })
    delete partidas[chat]
  }
}

handler.command = ['adivinanza', 'adivina']
handler.tags = ['juegos']
handler.group = true
handler.help = ['adivinanza']
export default handler
