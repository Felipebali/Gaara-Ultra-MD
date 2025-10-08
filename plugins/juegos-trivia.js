// plugins/triviaPro.js
let triviaHandler = async (m, { conn }) => {
    try {
        const chatData = global.db.data.chats[m.chat] || {};
        if (chatData.games === false) {
            return await conn.sendMessage(m.chat, { text: '⚠️ Los mini-juegos están desactivados. Usa *.juegos* para activarlos.' }, { quoted: m });
        }

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

        global.triviaAnswers = global.triviaAnswers || {};
        global.triviaAnswers[m.chat] = { correcta: pregunta.correcta, categoria: pregunta.categoria };

        global.triviaPuntos = global.triviaPuntos || {};
        global.triviaPuntos[m.chat] = global.triviaPuntos[m.chat] || {};

        const botones = [
            { buttonId: `trivia_${m.chat}_A`, buttonText: { displayText: "A" }, type: 1 },
            { buttonId: `trivia_${m.chat}_B`, buttonText: { displayText: "B" }, type: 1 },
            { buttonId: `trivia_${m.chat}_C`, buttonText: { displayText: "C" }, type: 1 },
            { buttonId: `trivia_${m.chat}_D`, buttonText: { displayText: "D" }, type: 1 }
        ];

        const texto = `🎲 *FelixCat Trivia Pro* 🎲\n\n📂 Categoría: ${pregunta.categoria}\n\n❓ ${pregunta.pregunta}\n\n${pregunta.opciones.join("\n")}\n\nSelecciona tu respuesta usando los botones.`;

        await conn.sendMessage(m.chat, {
            text: texto,
            footer: "FelixCat 🐾",
            buttons: botones,
            headerType: 1
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        try { await conn.sendMessage(m.chat, { text: '✖️ Error al iniciar la trivia.' }, { quoted: m }); } catch {}
    }
};

// --- Handler global de botones ---
triviaHandler.all = async (m, { conn }) => {
    try {
        if (!m.message?.buttonsResponseMessage) return;
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
            await conn.sendMessage(m.chat, { text: `✅ ¡Correcto, ${m.pushName}! Tienes ${global.triviaPuntos[m.chat][userId]} puntos.` }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { text: `❌ Incorrecto, ${m.pushName}. La respuesta correcta era *${correcta}*.` }, { quoted: m });
        }

        delete global.triviaAnswers[m.chat];
    } catch (e) {
        console.error(e);
    }
};

triviaHandler.command = ['trivia'];
triviaHandler.group = true;
triviaHandler.register = true;
export default triviaHandler;
