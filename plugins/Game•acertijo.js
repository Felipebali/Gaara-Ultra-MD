// plugins/Game•acertijo.js
import { proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (!chatSettings.games) return; // Solo si juegos están activados

    if (!conn.tekateki) conn.tekateki = {};
    const id = m.chat;

    // Si ya hay un acertijo activo, no se puede iniciar otro
    if (id in conn.tekateki) {
        await conn.sendMessage(m.chat, { text: '⚠️ Todavía hay un acertijo activo en este chat. Responde el actual primero.' }, { quoted: m });
        return;
    }

    // Lista de acertijos con opciones
    const quizzes = [
        { question: "¿Capital de Francia?", options: ["A) París","B) Madrid","C) Berlín","D) Roma"], answer: "A" },
        { question: "2 + 2 = ?", options: ["A) 3","B) 4","C) 5","D) 6"], answer: "B" },
        { question: "Planeta rojo", options: ["A) Venus","B) Marte","C) Júpiter","D) Saturno"], answer: "B" },
        { question: "Río más largo del mundo", options: ["A) Amazonas","B) Nilo","C) Yangtsé","D) Misisipi"], answer: "B" },
        { question: "Animal más rápido", options: ["A) Guepardo","B) León","C) Tigre","D) Caballo"], answer: "A" },
        { question: "Color del cielo en un día despejado", options: ["A) Rojo","B) Verde","C) Azul","D) Amarillo"], answer: "C" },
        { question: "Día después del lunes", options: ["A) Martes","B) Miércoles","C) Domingo","D) Viernes"], answer: "A" },
        { question: "Se bebe y es vital para la vida", options: ["A) Leche","B) Agua","C) Jugo","D) Vino"], answer: "B" },
        { question: "¿Qué gas respiramos para vivir?", options: ["A) Oxígeno","B) Nitrógeno","C) Dióxido de carbono","D) Helio"], answer: "A" },
        { question: "¿Cuál es el metal más ligero?", options: ["A) Hierro","B) Oro","C) Litio","D) Plomo"], answer: "C" }
    ];

    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];

    const buttons = [
        { buttonId: 'A', buttonText: { displayText: 'A' }, type: 1 },
        { buttonId: 'B', buttonText: { displayText: 'B' }, type: 1 },
        { buttonId: 'C', buttonText: { displayText: 'C' }, type: 1 },
        { buttonId: 'D', buttonText: { displayText: 'D' }, type: 1 }
    ];

    const buttonMessage = {
        text: `ⷮ🚩 *ACERTIJO*\n✨ *${quiz.question}*\n\n${quiz.options.join("\n")}\n\n⏱️ Tiempo: 30 segundos\n💬 Toca la opción correcta:`,
        buttons: buttons,
        headerType: 1
    };

    // Guardar acertijo activo
    conn.tekateki[id] = {
        answer: quiz.answer,
        timeout: setTimeout(async () => {
            if (conn.tekateki[id]) {
                await conn.sendMessage(m.chat, { text: `⏰ Se acabó el tiempo!\nRespuesta correcta: *${quiz.answer}*` }, { quoted: m });
                delete conn.tekateki[id];
            }
        }, 30000)
    };

    await conn.sendMessage(m.chat, buttonMessage);
};

// Handler para todas las respuestas (botones)
handler.all = async (m, { conn }) => {
    if (!conn.tekateki) return;
    const id = m.chat;
    if (!(id in conn.tekateki)) return;

    const msgText = (m.text || '').toUpperCase();
    const correct = conn.tekateki[id].answer;

    if (msgText === correct) {
        await conn.reply(m.chat, `🎉 Correcto! La respuesta es *${correct}*`, m);
        clearTimeout(conn.tekateki[id].timeout);
        delete conn.tekateki[id];
    } else if (["A","B","C","D"].includes(msgText)) {
        await conn.reply(m.chat, `❌ Incorrecto, seguí intentando!`, m);
    }
};

handler.help = ['acertijo'];
handler.tags = ['game'];
handler.command = ['acertijo', 'acert', 'tekateki'];
handler.group = true;

export default handler;
