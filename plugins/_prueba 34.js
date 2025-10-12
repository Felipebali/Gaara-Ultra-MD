// plugins/bandera0.js
global.flagGame = global.flagGame || {}
global.flagRanking = global.flagRanking || {}

const flags = [
    { name: "Uruguay", emoji: "🇺🇾" }, { name: "Argentina", emoji: "🇦🇷" },
    { name: "Brasil", emoji: "🇧🇷" }, { name: "Chile", emoji: "🇨🇱" },
    { name: "México", emoji: "🇲🇽" }, { name: "España", emoji: "🇪🇸" },
    { name: "Japón", emoji: "🇯🇵" }, { name: "Francia", emoji: "🇫🇷" },
    { name: "Alemania", emoji: "🇩🇪" }, { name: "Italia", emoji: "🇮🇹" },
    { name: "Estados Unidos", emoji: "🇺🇸" }, { name: "Canadá", emoji: "🇨🇦" },
    { name: "Reino Unido", emoji: "🇬🇧" }, { name: "India", emoji: "🇮🇳" },
    { name: "China", emoji: "🇨🇳" }, { name: "Rusia", emoji: "🇷🇺" }
]

const TIME_LIMIT = 15000 // 15 segundos
const MAX_TRIES = 3

const handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {}
    if (chatSettings.games === false) return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' })

    const correct = flags[Math.floor(Math.random() * flags.length)]

    // Mezclar opciones y asignar números
    let options = [correct.name]
    while (options.length < 4) {
        const opt = flags[Math.floor(Math.random() * flags.length)].name
        if (!options.includes(opt)) options.push(opt)
    }
    options = options.sort(() => Math.random() - 0.5)
    const correctIndex = options.indexOf(correct.name) + 1

    // Guardar juego en memoria
    global.flagGame[m.chat] = {
        answer: correctIndex,
        tries: MAX_TRIES,
        timeout: setTimeout(() => {
            if (global.flagGame[m.chat]) {
                conn.sendMessage(m.chat, { text: `<b>⏰ Se acabó el tiempo</b>\nLa bandera correcta era: <i>${correct.name}</i> ${correct.emoji}`, parse_mode: 'html' })
                delete global.flagGame[m.chat]
            }
        }, TIME_LIMIT)
    }

    // Construir mensaje HTML mejorado
    let text = `
<b>🌍 ¡Adivina la bandera!</b>

${correct.emoji.repeat(3)}

<b>Opciones:</b>
`
    options.forEach((o, i) => {
        text += `<b>${i + 1}.</b> ${o}\n`
    })

    text += `
<b>📌 Cómo responder:</b> Envía el <i>número</i> de la opción correcta (1-4)
<b>⏱ Tiempo límite:</b> <i>${TIME_LIMIT / 1000} segundos</i>
<b>🎯 Intentos disponibles:</b> <b>${MAX_TRIES}</b>
`

    await conn.sendMessage(m.chat, { text, parse_mode: 'html' })
}

handler.before = async (m, { conn }) => {
    if (!m.text) return
    const game = global.flagGame[m.chat]
    if (!game) return

    const answer = game.answer
    const userAnswer = parseInt(m.text)

    if (userAnswer === answer) {
        clearTimeout(game.timeout)
        await conn.sendMessage(m.chat, { text: `✅ <b>¡Correcto!</b> 🎉\nLa opción correcta era: <i>${answer}</i>`, parse_mode: 'html' })

        global.flagRanking[m.chat] = global.flagRanking[m.chat] || {}
        global.flagRanking[m.chat][m.sender] = (global.flagRanking[m.chat][m.sender] || 0) + 1

        delete global.flagGame[m.chat]
    } else {
        game.tries--
        if (game.tries <= 0) {
            clearTimeout(game.timeout)
            await conn.sendMessage(m.chat, { text: `❌ <b>Se acabaron tus intentos</b>\nLa opción correcta era: <i>${answer}</i>`, parse_mode: 'html' })
            delete global.flagGame[m.chat]
        } else {
            await conn.sendMessage(m.chat, { text: `❌ Respuesta incorrecta\nIntentos restantes: <b>${game.tries}</b>`, parse_mode: 'html' })
        }
    }
}

handler.command = ['bandera0']
handler.help = ['bandera0']
handler.tags = ['juegos']
handler.group = false

export default handler
