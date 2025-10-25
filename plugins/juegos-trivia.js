// plugins/trivia.js
let activeTrivia = {}

const preguntasTrivia = [
  { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["A) Marte", "B) Júpiter", "C) Saturno", "D) Neptuno"], respuesta: "B" },
  { pregunta: "¿Quién pintó 'La última cena'?", opciones: ["A) Leonardo da Vinci", "B) Miguel Ángel", "C) Picasso", "D) Van Gogh"], respuesta: "A" },
  { pregunta: "¿Cuál es el río más largo del mundo?", opciones: ["A) Amazonas", "B) Nilo", "C) Yangtsé", "D) Misisipi"], respuesta: "A" },
  { pregunta: "¿En qué año llegó el hombre a la Luna?", opciones: ["A) 1965", "B) 1969", "C) 1971", "D) 1959"], respuesta: "B" },
  { pregunta: "¿Cuál es el animal terrestre más veloz?", opciones: ["A) León", "B) Tigre", "C) Guepardo", "D) Lobo"], respuesta: "C" },
  { pregunta: "¿Cuál es el océano más grande?", opciones: ["A) Atlántico", "B) Índico", "C) Pacífico", "D) Ártico"], respuesta: "C" },
  { pregunta: "¿Qué gas respiramos para vivir?", opciones: ["A) Nitrógeno", "B) Oxígeno", "C) Dióxido de carbono", "D) Helio"], respuesta: "B" },
  { pregunta: "¿Cuál es la capital de Japón?", opciones: ["A) Seúl", "B) Tokio", "C) Kioto", "D) Osaka"], respuesta: "B" },
  { pregunta: "¿Quién escribió 'Cien años de soledad'?", opciones: ["A) Mario Vargas Llosa", "B) Gabriel García Márquez", "C) Pablo Neruda", "D) Julio Cortázar"], respuesta: "B" },
  { pregunta: "¿Cuál es el metal más ligero?", opciones: ["A) Aluminio", "B) Hierro", "C) Litio", "D) Mercurio"], respuesta: "C" },
  { pregunta: "¿Qué país ganó el Mundial de fútbol 2022?", opciones: ["A) Francia", "B) Brasil", "C) Argentina", "D) España"], respuesta: "C" },
  { pregunta: "¿Cuál es el idioma más hablado del mundo?", opciones: ["A) Inglés", "B) Mandarín", "C) Español", "D) Hindi"], respuesta: "B" },
  { pregunta: "¿Qué elemento químico tiene el símbolo ‘O’?", opciones: ["A) Oro", "B) Oxígeno", "C) Osmio", "D) Oxalato"], respuesta: "B" },
  { pregunta: "¿Qué país tiene forma de bota?", opciones: ["A) Portugal", "B) Italia", "C) Grecia", "D) España"], respuesta: "B" },
  { pregunta: "¿Cuál es el inventor del teléfono?", opciones: ["A) Nikola Tesla", "B) Alexander Graham Bell", "C) Thomas Edison", "D) Einstein"], respuesta: "B" },
  { pregunta: "¿Cuál es la capital de Canadá?", opciones: ["A) Toronto", "B) Ottawa", "C) Vancouver", "D) Montreal"], respuesta: "B" },
  { pregunta: "¿Qué vitamina se obtiene del sol?", opciones: ["A) Vitamina A", "B) Vitamina C", "C) Vitamina D", "D) Vitamina B12"], respuesta: "C" },
  { pregunta: "¿Cuál es el país más poblado del mundo?", opciones: ["A) China", "B) India", "C) Estados Unidos", "D) Indonesia"], respuesta: "B" },
  { pregunta: "¿Qué órgano bombea la sangre en el cuerpo?", opciones: ["A) Pulmón", "B) Corazón", "C) Riñón", "D) Hígado"], respuesta: "B" },
  { pregunta: "¿Qué instrumento mide la temperatura?", opciones: ["A) Barómetro", "B) Termómetro", "C) Higrómetro", "D) Anemómetro"], respuesta: "B" }
]

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};

  // 🟡 Si los juegos están desactivados, no permite usar trivia
  if (!chat.games) {
    return conn.reply(m.chat, "🚫 Los mini-juegos están desactivados en este grupo.\nUsa *.juegos* para activarlos.", m);
  }

  if (activeTrivia[m.chat]) return conn.reply(m.chat, "❗ Ya hay una trivia en curso. Espera a que termine.", m);

  const pregunta = preguntasTrivia[Math.floor(Math.random() * preguntasTrivia.length)];
  const texto = `🎯 *Trivia de Conocimiento* 🎯\n\n${pregunta.pregunta}\n\n${pregunta.opciones.join('\n')}\n\nResponde con la letra correcta (A, B, C o D).`;

  await conn.reply(m.chat, texto, m);
  activeTrivia[m.chat] = { ...pregunta };

  // Tiempo límite
  activeTrivia[m.chat].timeout = setTimeout(() => {
    if (activeTrivia[m.chat]) {
      conn.reply(m.chat, `⏰ Tiempo agotado. La respuesta correcta era: *${pregunta.respuesta}*.`);
      delete activeTrivia[m.chat];
    }
  }, 30000);
};

handler.command = /^trivia$/i;
handler.group = true;
export default handler;

// 📩 Captura las respuestas de los usuarios
handler.all = async function (m) {
  const conn = global.conn;
  if (!m.text || !activeTrivia[m.chat]) return;
  const juego = activeTrivia[m.chat];

  const respuestaUsuario = m.text.trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(respuestaUsuario)) return;

  if (respuestaUsuario === juego.respuesta) {
    clearTimeout(juego.timeout);
    await conn.reply(m.chat, `✅ ¡Correcto, ${m.pushName || "usuario"}! La respuesta era *${juego.respuesta}*.`);
    delete activeTrivia[m.chat];
  } else {
    await conn.reply(m.chat, `❌ Incorrecto, ${m.pushName || "usuario"}. Intenta de nuevo.`);
  }
};
