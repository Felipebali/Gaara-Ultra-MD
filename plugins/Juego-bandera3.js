// plugins/bandera3.js
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
    { name: "China", emoji: "🇨🇳" }, { name: "Rusia", emoji: "🇷🇺" },
    { name: "Portugal", emoji: "🇵🇹" }, { name: "Países Bajos", emoji: "🇳🇱" },
    { name: "Grecia", emoji: "🇬🇷" }, { name: "Bélgica", emoji: "🇧🇪" }
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
    const correctIndex = options.indexOf(correct.name) + 1 // Número correcto

    // Guardar juego en memoria
    global.flagGame[m.chat] = {
        answer: correctIndex,
        tries: MAX_TRIES,
        timeout: setTimeout(() => {
            if (global.flagGame[m.chat]) {
                conn.sendMessage(m.chat, { text: `⏰ Se acabó el tiempo. La bandera era de *${correct.name}*` })
                delete global.flagGame[m.chat]
            }
        }, TIME_LIMIT)
    }

    let text = `🌍 *Adivina la bandera*\n\n${correct.emoji}\n\nOpciones:`
    options.forEach((o, i) => text += `\n${i + 1}. ${o}`)
    text += `\n\nResponde con el número correcto (1-4). Tienes ${TIME_LIMIT / 1000} segundos y ${MAX_TRIES} intentos.`

    await conn.sendMessage(m.chat, { text })
}

handler.before = async (m, { conn }) => {
    if (!m.text) return
    const game = global.flagGame[m.chat]
    if (!game) return

    const answer = game.answer
    const userAnswer = parseInt(m.text)

    if (userAnswer === answer) {
        clearTimeout(game.timeout)
        await conn.sendMessage(m.chat, { text: `✅ Correcto! 🎉` })

        // Registrar aciertos
        global.flagRanking[m.chat] = global.flagRanking[m.chat] || {}
        global.flagRanking[m.chat][m.sender] = (global.flagRanking[m.chat][m.sender] || 0) + 1

        delete global.flagGame[m.chat]
    } else {
        game.tries--
        if (game.tries <= 0) {
            clearTimeout(game.timeout)
            await conn.sendMessage(m.chat, { text: `❌ Se acabaron tus intentos. La bandera correcta era la opción ${answer}` })
            delete global.flagGame[m.chat]
        } else {
            await conn.sendMessage(m.chat, { text: `❌ Respuesta incorrecta. Intentos restantes: ${game.tries}` })
        }
    }
}

handler.command = ['bandera3']
handler.help = ['bandera3']
handler.tags = ['juegos']
handler.group = false

export default handler
