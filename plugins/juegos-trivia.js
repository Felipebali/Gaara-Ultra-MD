// plugins/triviaPro.js
let triviaHandler = async (m) => {
    try {
        const chatData = global.db.data.chats[m.chat] || {};
        if (chatData.games === false) {
            return await m.client.sendMessage(m.chat, { text: '⚠️ Los mini-juegos están desactivados. Usa *.juegos* para activarlos.' }, { quoted: m });
        }

        // Preguntas divididas por categorías
        const trivia = [
            { pregunta: "¿Cuál es la capital de Francia?", opciones: ["A. París","B. Londres","C. Berlín","D. Madrid"], correcta: "A", categoria: "General" },
            { pregunta: "¿Cuál es el río más largo del mundo?", opciones: ["A. Nilo","B. Amazonas","C. Misisipi","D. Yangtsé"], correcta: "B", categoria: "General" },
            { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["A. Marte","B. Júpiter","C. Saturno","D. Venus"], correcta: "B", categoria: "Ciencia" },
            { pregunta: "¿Qué gas respiramos los humanos?", opciones: ["A. Oxígeno","B. Hidrógeno","C. Nitrógeno","D. Helio"], correcta: "A", categoria: "Ciencia" },
            { pregunta: "¿En qué año llegó el hombre a la Luna?", opciones: ["A. 1965","B. 1969","C. 1972","D. 1975"], correcta: "B", categoria: "Historia" },
            { pregunta: "¿Quién fue el primer presidente de Estados Unidos?", opciones: ["A. Thomas Jefferson","B. Abraham Lincoln","C. George Washington","D. John Adams"], correcta: "C", categoria: "Historia" },
            { pregunta: "¿Quién es el protagonista de Naruto?", opciones: ["A. Sasuke","B. Naruto","C. Kakashi","D. Sakura"], correcta: "B", categoria: "Anime" },
            { pregunta: "¿A qué grupo pertenece Luffy?", opciones: ["A. Akatsuki","B. Straw Hat","C. Phantom Troupe","D. Whitebeard"], correcta: "B", categoria: "Anime" }
        ];

        const pregunta = trivia[Math.floor(Math.random() * trivia.length)];

        // Guarda respuesta y categoría temporal
        global.triviaAnswers = global.triviaAnswers || {};
        global.triviaAnswers[m.chat] = { correcta: pregunta.correcta, categoria: pregunta.categoria };

        // Inicializa puntos por jugador en este chat
        global.triviaPuntos = global.triviaPuntos || {};
        global.triviaPuntos[m.chat] = global.triviaPuntos[m.chat] || {};

        // Botones A/B/C/D
        const botones = [
            { buttonId: `trivia_${m.chat}_A`, buttonText: { displayText: "A" }, type: 1 },
            { buttonId: `trivia_${m.chat}_B`, buttonText: { displayText: "B" }, type: 1 },
            { buttonId: `trivia_${m.chat}_C`, buttonText: { displayText: "C" }, type: 1 },
            { buttonId: `trivia_${m.chat}_D`, buttonText: { displayText: "D" }, type: 1 }
        ];

        const texto = `🎲 *FelixCat Trivia Pro* 🎲\n\n📂 Categoría: ${pregunta.categoria}\n\n❓ ${pregunta.pregunta}\n\n${pregunta.opciones.join("\n")}\n\nSelecciona tu respuesta usando los botones.`;

        await m.client.sendMessage(m.chat, {
            text: texto,
            footer: "FelixCat 🐾",
            buttons: botones,
            headerType: 1
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await m.client.sendMessage(m.chat, { text: '✖️ Error al iniciar la trivia.' }, { quoted: m });
    }
};

// --- Handler global para respuestas con botones ---
triviaHandler.all = async (m) => {
    try {
        if (!m.message?.buttonsResponseMessage) return; // Solo botones
        if (!global.triviaAnswers || !global.triviaAnswers[m.chat]) return;

        const correcta = global.triviaAnswers[m.chat].correcta.toUpperCase();
        const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
        const respuesta = buttonId.split("_").pop().toUpperCase();

        if (!["A","B","C","D"].includes(respuesta)) return;

        const userId = m.sender;
        global.triviaPuntos = global.triviaPuntos || {};
        global.triviaPuntos[m.chat] = global.triviaPuntos[m.chat] || {};
        global.triviaPuntos[m.chat][userId] = global.triviaPuntos[m.chat][userId] || 0;

        if (respuesta === correcta) {
            global.triviaPuntos[m.chat][userId] += 1;
            await m.client.sendMessage(m.chat, { text: `✅ ¡Correcto, ${m.pushName}! Tienes ${global.triviaPuntos[m.chat][userId]} puntos.` }, { quoted: m });
        } else {
            await m.client.sendMessage(m.chat, { text: `❌ Incorrecto, ${m.pushName}. La respuesta correcta era *${correcta}*.` }, { quoted: m });
        }

        delete global.triviaAnswers[m.chat]; // elimina pregunta actual

    } catch (e) {
        console.error(e);
    }
};

triviaHandler.command = ['trivia'];
triviaHandler.group = true;
triviaHandler.register = true; // global handler
export default triviaHandler;
