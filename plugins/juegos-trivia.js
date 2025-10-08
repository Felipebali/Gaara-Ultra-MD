// plugins/trivia.js
let handler = async (m, { conn }) => {
    try {
        // Verifica si los juegos están activados en este chat
        const chat = global.db.data.chats[m.chat] || {};
        if (chat.games === false) {
            return await conn.sendMessage(m.chat, { text: '⚠️ Los mini-juegos están desactivados. Usa *.juegos* para activarlos.' }, { quoted: m });
        }

        // Lista de preguntas de trivia
        const trivia = [
            {
                pregunta: "¿Cuál es la capital de Francia?",
                opciones: ["A. París", "B. Londres", "C. Berlín", "D. Madrid"],
                correcta: "A"
            },
            {
                pregunta: "¿Quién escribió 'Cien años de soledad'?",
                opciones: ["A. Pablo Neruda", "B. Gabriel García Márquez", "C. Julio Cortázar", "D. Mario Vargas Llosa"],
                correcta: "B"
            },
            {
                pregunta: "¿Cuál es el planeta más grande del sistema solar?",
                opciones: ["A. Marte", "B. Júpiter", "C. Saturno", "D. Venus"],
                correcta: "B"
            },
            {
                pregunta: "¿En qué año llegó el hombre a la Luna?",
                opciones: ["A. 1965", "B. 1969", "C. 1972", "D. 1975"],
                correcta: "B"
            },
            {
                pregunta: "¿Qué idioma se habla en Brasil?",
                opciones: ["A. Español", "B. Portugués", "C. Inglés", "D. Francés"],
                correcta: "B"
            },
            {
                pregunta: "¿Cuál es el río más largo del mundo?",
                opciones: ["A. Nilo", "B. Amazonas", "C. Misisipi", "D. Yangtsé"],
                correcta: "B"
            },
            {
                pregunta: "¿Quién pintó la Mona Lisa?",
                opciones: ["A. Miguel Ángel", "B. Leonardo da Vinci", "C. Van Gogh", "D. Picasso"],
                correcta: "B"
            }
        ];

        // Selecciona una pregunta aleatoria
        const pregunta = trivia[Math.floor(Math.random() * trivia.length)];

        // Guarda la respuesta correcta temporalmente
        global.triviaAnswers = global.triviaAnswers || {};
        global.triviaAnswers[m.chat] = pregunta.correcta;

        // Texto a enviar
        let texto = `🎲 *Trivia Time!*\n\n${pregunta.pregunta}\n\n`;
        texto += pregunta.opciones.join("\n");
        texto += `\n\nResponde con la letra de la opción correcta.`;

        await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, '✖️ Error al iniciar la trivia.');
    }
};

handler.command = ['trivia'];
handler.group = true;

export default handler;
