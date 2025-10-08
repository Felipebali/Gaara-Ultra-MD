// plugins/triviaPro.js
let triviaHandler = async (m, { conn }) => {
    try {
        // Verifica si los juegos están activados en este chat
        const chatData = global.db.data.chats[m.chat] || {};
        if (chatData.games === false) {
            return await conn.sendMessage(m.chat, { text: '⚠️ Los mini-juegos están desactivados. Usa *.juegos* para activarlos.' }, { quoted: m });
        }

        // Preguntas divididas por categorías
        const trivia = [
            // General
            { pregunta: "¿Cuál es la capital de Francia?", opciones: ["A. París","B. Londres","C. Berlín","D. Madrid"], correcta: "A", categoria: "General" },
            { pregunta: "¿Cuál es el río más largo del mundo?", opciones: ["A. Nilo","B. Amazonas","C. Misisipi","D. Yangtsé"], correcta: "B", categoria: "General" },
            // Ciencia
            { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["A. Marte","B. Júpiter","C. Saturno","D. Venus"], correcta: "B", categoria: "Ciencia" },
            { pregunta: "¿Qué gas respiramos los humanos?", opciones: ["A. Oxígeno","B. Hidrógeno","C. Nitrógeno","D. Helio"], correcta: "A", categoria: "Ciencia" },
            // Historia
            { pregunta: "¿En qué año llegó el hombre a la Luna?", opciones: ["A. 1965","B. 1969","C. 1972","D. 1975"], correcta: "B", categoria: "Historia" },
            { pregunta: "¿Quién fue el primer presidente de Estados Unidos?", opciones: ["A. Thomas Jefferson","B. Abraham Lincoln","C. George Washington","D. John Adams"], correcta: "C", categoria: "Historia" },
            // Anime
            { pregunta: "¿Quién es el protagonista de Naruto?", opciones: ["A. Sasuke","B. Naruto","C. Kakashi","D. Sakura"], correcta: "B", categoria: "Anime" },
            { pregunta: "¿A qué grupo pertenece Luffy?", opciones: ["A. Akatsuki","B. Straw Hat","C. Phantom Troupe","D. Whitebeard"], correcta: "B", categoria: "Anime" }
            // Se pueden agregar muchas más preguntas aquí...
        ];

        // Selecciona pregunta aleatoria
        const pregunta = trivia[Math.floor(Math.random() * trivia.length)];

        // Guarda la respuesta correcta y categoría temporalmente
        global.triviaAnswers = global.triviaAnswers || {};
        global.triviaAnswers[m.chat] = {
            correcta: pregunta.correcta,
            categoria: pregunta.categoria
        };

        // Inicializa puntos por jugador en el chat
        global.triviaPuntos = global.triviaPuntos || {};
        global.triviaPuntos[m.chat] = global.triviaPuntos[m.chat] || {};

        // Botones A/B/C/D
        let botones = [
            { buttonId: `trivia_${m.chat}_A`, buttonText: { displayText: "A" }, type: 1 },
            { buttonId: `trivia_${m.chat}_B`, buttonText: { displayText: "B" }, type: 1 },
            { buttonId: `trivia_${m.chat}_C`, buttonText: { displayText: "C" }, type: 1 },
            { buttonId: `trivia_${m.chat}_D`, buttonText: { displayText: "D" }, type: 1 }
        ];

        let texto = `🎲 *FelixCat Trivia Pro* 🎲\n\n`;
        texto += `📂 Categoría: ${pregunta.categoria}\n\n`;
        texto += `❓ ${pregunta.pregunta}\n\n`;
        texto += pregunta.opciones.join("\n");
        texto += `\n\nSelecciona tu respuesta usando los botones.`;

        await conn.sendMessage(m.chat, {
            text: texto,
            footer: "FelixCat 🐾",
            buttons: botones,
            headerType: 1
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '✖️ Error al iniciar la trivia.' }, { quoted: m });
    }
};

triviaHandler.command = ['trivia'];
triviaHandler.group = true;

// --- Handler global para respuestas con botones ---
triviaHandler.all = async (m, { conn }) => {
    if (!m.message?.buttonsResponseMessage) return; // Solo respuestas de botón
    if (!global.triviaAnswers || !global.triviaAnswers[m.chat]) return;

    const correcta = global.triviaAnswers[m.chat].correcta.toUpperCase();
    const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
    const respuesta = buttonId.split("_").pop().toUpperCase();

    if (["A","B","C","D"].includes(respuesta)) {
        const userId = m.sender;
        global.triviaPuntos[m.chat][userId] = global.triviaPuntos[m.chat][userId] || 0;

        if (respuesta === correcta) {
            global.triviaPuntos[m.chat][userId] += 1; // Suma 1 punto
            await conn.sendMessage(m.chat, { text: `✅ ¡Correcto, ${m.pushName}! Tienes ${global.triviaPuntos[m.chat][userId]} puntos.` }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { text: `❌ Incorrecto, ${m.pushName}. La respuesta correcta era *${correcta}*.` }, { quoted: m });
        }

        delete global.triviaAnswers[m.chat]; // elimina pregunta actual
    }
};

export default triviaHandler;
