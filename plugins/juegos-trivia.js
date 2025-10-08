let activeTrivia = {}

const preguntasTrivia = [
  {
    pregunta: "¿Cuál es el planeta más grande del sistema solar?",
    opciones: ["A) Marte", "B) Júpiter", "C) Saturno", "D) Neptuno"],
    respuesta: "B"
  },
  {
    pregunta: "¿Quién pintó 'La última cena'?",
    opciones: ["A) Leonardo da Vinci", "B) Miguel Ángel", "C) Picasso", "D) Van Gogh"],
    respuesta: "A"
  },
  {
    pregunta: "¿Cuál es el río más largo del mundo?",
    opciones: ["A) Amazonas", "B) Nilo", "C) Yangtsé", "D) Misisipi"],
    respuesta: "A"
  },
  {
    pregunta: "¿En qué año llegó el hombre a la Luna?",
    opciones: ["A) 1965", "B) 1969", "C) 1971", "D) 1959"],
    respuesta: "B"
  },
  {
    pregunta: "¿Cuál es el animal terrestre más veloz?",
    opciones: ["A) León", "B) Tigre", "C) Guepardo", "D) Lobo"],
    respuesta: "C"
  },
  {
    pregunta: "¿Cuál es el océano más grande?",
    opciones: ["A) Atlántico", "B) Índico", "C) Pacífico", "D) Ártico"],
    respuesta: "C"
  },
  {
    pregunta: "¿Qué gas respiramos para vivir?",
    opciones: ["A) Nitrógeno", "B) Oxígeno", "C) Dióxido de carbono", "D) Helio"],
    respuesta: "B"
  },
  {
    pregunta: "¿Cuál es la capital de Japón?",
    opciones: ["A) Seúl", "B) Tokio", "C) Kioto", "D) Osaka"],
    respuesta: "B"
  },
  {
    pregunta: "¿Quién escribió 'Cien años de soledad'?",
    opciones: ["A) Mario Vargas Llosa", "B) Gabriel García Márquez", "C) Pablo Neruda", "D) Julio Cortázar"],
    respuesta: "B"
  },
  {
    pregunta: "¿Cuál es el metal más ligero?",
    opciones: ["A) Aluminio", "B) Hierro", "C) Litio", "D) Mercurio"],
    respuesta: "C"
  },
  {
    pregunta: "¿Qué país ganó el Mundial de fútbol 2022?",
    opciones: ["A) Francia", "B) Brasil", "C) Argentina", "D) España"],
    respuesta: "C"
  },
  {
    pregunta: "¿Cuál es el idioma más hablado del mundo?",
    opciones: ["A) Inglés", "B) Mandarín", "C) Español", "D) Hindi"],
    respuesta: "B"
  },
  {
    pregunta: "¿Qué elemento químico tiene el símbolo ‘O’?",
    opciones: ["A) Oro", "B) Oxígeno", "C) Osmio", "D) Oxalato"],
    respuesta: "B"
  },
  {
    pregunta: "¿Qué país tiene forma de bota?",
    opciones: ["A) Portugal", "B) Italia", "C) Grecia", "D) España"],
    respuesta: "B"
  },
  {
    pregunta: "¿Cuál es el inventor del teléfono?",
    opciones: ["A) Nikola Tesla", "B) Alexander Graham Bell", "C) Thomas Edison", "D) Einstein"],
    respuesta: "B"
  }
]

// Comando principal
let handler = async (m, { conn, usedPrefix }) => {
  if (activeTrivia[m.chat]) {
    return conn.sendMessage(m.chat, { text: "❗ Ya hay una trivia en curso. Responde antes de iniciar otra." }, { quoted: m })
  }

  const pregunta = preguntasTrivia[Math.floor(Math.random() * preguntasTrivia.length)]
  const texto = `🎯 *Trivia de Conocimiento* 🎯\n\n${pregunta.pregunta}\n\n${pregunta.opciones.join('\n')}\n\nResponde con la letra correcta (A, B, C o D).`

  await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
  activeTrivia[m.chat] = { ...pregunta, autor: m.sender }

  // Auto-cancelar en 30 segundos si no responden
  setTimeout(() => {
    if (activeTrivia[m.chat]) {
      conn.sendMessage(m.chat, { text: "⏰ Se acabó el tiempo. Nadie respondió." })
      delete activeTrivia[m.chat]
    }
  }, 30000)
}

handler.command = /^trivia$/i
handler.group = true
export default handler

// Captura todas las respuestas
handler.all = async function (m, { conn }) {
  if (!m.text || !activeTrivia[m.chat]) return
  const juego = activeTrivia[m.chat]

  if (["A", "B", "C", "D"].includes(m.text.trim().toUpperCase())) {
    if (m.sender === juego.autor) {
      const respuesta = m.text.trim().toUpperCase()
      if (respuesta === juego.respuesta) {
        await conn.sendMessage(m.chat, { text: `✅ ¡Correcto, ${m.pushName || "usuario"}! La respuesta era *${juego.respuesta})*.` })
      } else {
        await conn.sendMessage(m.chat, { text: `❌ Incorrecto, ${m.pushName || "usuario"}. La respuesta correcta era *${juego.respuesta})*.` })
      }
      delete activeTrivia[m.chat]
    }
  }
}
