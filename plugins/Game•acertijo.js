// plugins/Game•acertijo.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (!chatSettings.games) return; // Solo si juegos están activados

    if (!conn.tekateki) conn.tekateki = {};
    const id = m.chat;

    // Si ya hay un acertijo activo, revisamos la respuesta
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

    // Lista de acertijos con opciones
    const quizzes = [
        { question: "¿Capital de Francia?", options: ["A) París","B) Madrid","C) Berlín","D) Roma"], answer: "a" },
        { question: "2 + 2 = ?", options: ["A) 3","B) 4","C) 5","D) 6"], answer: "b" },
        { question: "Planeta rojo", options: ["A) Venus","B) Marte","C) Júpiter","D) Saturno"], answer: "b" },
        { question: "Río más largo del mundo", options: ["A) Amazonas","B) Nilo","C) Yangtsé","D) Misisipi"], answer: "b" },
        { question: "Animal más rápido", options: ["A) Guepardo","B) León","C) Tigre","D) Caballo"], answer: "a" },
        { question: "Color del cielo en un día despejado", options: ["A) Rojo","B) Verde","C) Azul","D) Amarillo"], answer: "c" },
        { question: "Día después del lunes", options: ["A) Martes","B) Miércoles","C) Domingo","D) Viernes"], answer: "a" },
        { question: "Se bebe y es vital para la vida", options: ["A) Leche","B) Agua","C) Jugo","D) Vino"], answer: "b" },
        { question: "¿Qué gas respiramos para vivir?", options: ["A) Oxígeno","B) Nitrógeno","C) Dióxido de carbono","D) Helio"], answer: "a" },
        { question: "¿Cuál es el metal más ligero?", options: ["A) Hierro","B) Oro","C) Litio","D) Plomo"], answer: "c" },
        { question: "¿Quién pintó La Mona Lisa?", options: ["A) Van Gogh","B) Picasso","C) Leonardo da Vinci","D) Rembrandt"], answer: "c" },
        { question: "¿Qué continente tiene más países?", options: ["A) África","B) Asia","C) Europa","D) América"], answer: "a" },
        { question: "Capital de Japón", options: ["A) Seúl","B) Tokio","C) Beijing","D) Bangkok"], answer: "b" },
        { question: "Elemento químico con símbolo H", options: ["A) Helio","B) Hidrógeno","C) Hierro","D) Mercurio"], answer: "b" },
        { question: "Animal que dice 'miau'", options: ["A) Perro","B) Gato","C) Vaca","D) Caballo"], answer: "b" }
    ];

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

// Este handler revisa todos los mensajes
handler.all = true;
handler.help = ['acertijo'];
handler.tags = ['game'];
handler.command = ['acertijo', 'acert', 'tekateki'];
handler.group = true;

export default handler;
