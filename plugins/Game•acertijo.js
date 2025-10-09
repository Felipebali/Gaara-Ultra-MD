// plugins/Game•acertijo.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (!chatSettings.games) return conn.reply(m.chat, '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.', m);

    if (!conn.tekateki) conn.tekateki = {};
    const id = m.chat;

    // Lista de acertijos con opciones
    const quizzes = [
        {
            question: "¿Capital de Francia?",
            options: ["A) París", "B) Madrid", "C) Berlín", "D) Roma"],
            answer: "a"
        },
        {
            question: "2 + 2 = ?",
            options: ["A) 3", "B) 4", "C) 5", "D) 6"],
            answer: "b"
        },
        {
            question: "Planeta rojo",
            options: ["A) Venus", "B) Marte", "C) Júpiter", "D) Saturno"],
            answer: "b"
        },
        {
            question: "Río más largo del mundo",
            options: ["A) Amazonas", "B) Nilo", "C) Yangtsé", "D) Misisipi"],
            answer: "b"
        },
        {
            question: "Animal más rápido",
            options: ["A) Guepardo", "B) León", "C) Tigre", "D) Caballo"],
            answer: "a"
        },
        {
            question: "Color del cielo",
            options: ["A) Rojo", "B) Verde", "C) Azul", "D) Amarillo"],
            answer: "c"
        },
        {
            question: "Día después del lunes",
            options: ["A) Martes", "B) Miércoles", "C) Domingo", "D) Viernes"],
            answer: "a"
        },
        {
            question: "Se bebe y es vital para la vida",
            options: ["A) Leche", "B) Agua", "C) Jugo", "D) Vino"],
            answer: "b"
        }
    ];

    // Si ya hay un acertijo activo en el chat
    if (id in conn.tekateki) {
        const userAnswer = m.text?.toLowerCase()?.trim();
        if (!userAnswer) return;

        if (userAnswer === conn.tekateki[id].answer) {
            await conn.reply(m.chat, `🎉 Correcto! La respuesta es *${conn.tekateki[id].answer.toUpperCase()}*`, m);
            clearTimeout(conn.tekateki[id].timeout);
            delete conn.tekateki[id];
        } else if (["a","b","c","d"].includes(userAnswer)) {
            await conn.reply(m.chat, `❌ Incorrecto, seguí intentando!`, m);
        }
        return;
    }

    // Elegir un quiz aleatorio
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];

    const caption = `ⷮ🚩 *ACERTIJO*\n✨ *${quiz.question}*\n\n${quiz.options.join("\n")}\n\n⏱️ Tiempo: 30 segundos\n💬 Responde con: a, b, c o d`;

    // Guardar acertijo activo
    conn.tekateki[id] = {
        answer: quiz.answer,
        timeout: setTimeout(async () => {
            if (conn.tekateki[id]) {
                await conn.reply(m.chat, `⏰ Se acabó el tiempo!\nRespuesta correcta: *${quiz.answer.toUpperCase()}*`, m);
                delete conn.tekateki[id];
            }
        }, 30000)
    };

    await conn.reply(m.chat, caption, m);
};

handler.help = ['acertijo'];
handler.tags = ['game'];
handler.command = ['acertijo', 'acert', 'tekateki'];
handler.group = true;

export default handler;
