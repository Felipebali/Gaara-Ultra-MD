// plugins/acertijo.js
const timeout = 30000; // 30 segundos

const handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (!chatSettings.games) return conn.reply(m.chat, '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.', m);

    conn.tekateki = conn.tekateki || {};
    const id = m.chat;
    if (id in conn.tekateki) return conn.reply(m.chat, '⚠️ Todavía hay acertijos sin responder en este chat', conn.tekateki[id][0]);

    const tekateki = [
        { question: "¿Cuál es la capital de Francia?", response: "parís" },
        { question: "¿2 + 2?", response: "4" },
        { question: "¿Qué planeta es conocido como el planeta rojo?", response: "marte" },
        // ...agregar más
    ];

    const json = tekateki[Math.floor(Math.random() * tekateki.length)];
    const caption = `
ⷮ🚩 *ACERTIJOS*
✨️ *${json.question}*
⏱️ *Tiempo:* ${(timeout / 1000).toFixed(0)} segundos`.trim();

    conn.tekateki[id] = { message: await conn.reply(m.chat, caption, m), answer: json.response.toLowerCase() };

    // Terminar el juego si se acaba el tiempo
    setTimeout(async () => {
        if (conn.tekateki[id]) {
            await conn.reply(m.chat, `🚩 Se acabó el tiempo!\n*Respuesta:* ${json.response}`, conn.tekateki[id].message);
            delete conn.tekateki[id];
        }
    }, timeout);
};

handler.all = async (m, { conn }) => {
    const id = m.chat;
    if (!conn.tekateki || !(id in conn.tekateki)) return;

    const userAnswer = m.text?.toLowerCase().trim();
    const correctAnswer = conn.tekateki[id].answer;

    if (!userAnswer) return;
    if (userAnswer === correctAnswer) {
        await conn.reply(m.chat, `🎉 Correcto! La respuesta es *${conn.tekateki[id].answer}*`, m);
        delete conn.tekateki[id];
    }
};

handler.help = ['acertijo'];
handler.tags = ['game'];
handler.command = ['acertijo', 'acert', 'tekateki'];
handler.group = true;

export default handler;
