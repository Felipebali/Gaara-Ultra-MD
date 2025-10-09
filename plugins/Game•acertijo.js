// plugins/Game•acertijo.js
let handler = async (m, { conn, usedPrefix, command }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) return conn.reply(m.chat, '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.', m);

    if (!conn.tekateki) conn.tekateki = {};
    const id = m.chat;

    // Lista de acertijos
    const tekateki = [
        { question: "¿Cuál es la capital de Francia?", response: "parís" },
        { question: "¿2 + 2?", response: "4" },
        { question: "¿Qué planeta es conocido como el planeta rojo?", response: "marte" },
        { question: "¿Cuál es el río más largo del mundo?", response: "nilo" },
        { question: "¿Quién escribió 'Romeo y Julieta'?", response: "shakespeare" },
        { question: "¿En qué año llegó el hombre a la luna?", response: "1969" },
        { question: "¿Cuál es el animal más rápido del mundo?", response: "guepardo" },
        { question: "¿Qué gas necesitamos para respirar?", response: "oxígeno" },
        { question: "¿Cuál es la moneda de Japón?", response: "yen" },
        { question: "¿Cuál es la montaña más alta del mundo?", response: "everest" },
        { question: "¿Qué idioma se habla en Brasil?", response: "portugués" },
        { question: "¿Qué instrumento tiene teclas blancas y negras?", response: "piano" },
        { question: "¿Cuál es el océano más grande?", response: "pacífico" },
        { question: "¿Cuál es el símbolo químico del oro?", response: "au" },
        { question: "¿Qué animal es conocido como el rey de la selva?", response: "león" },
        { question: "¿Cuántos colores tiene el arcoíris?", response: "7" },
        { question: "¿Quién pintó la Mona Lisa?", response: "da vinci" },
        { question: "¿Qué instrumento se usa para medir la temperatura?", response: "termómetro" },
        { question: "¿Cuál es el planeta más grande del sistema solar?", response: "júpiter" },
        { question: "¿Cómo se llama el satélite de la Tierra?", response: "luna" },
        { question: "¿Cuál es el país con la mayor población?", response: "china" },
        { question: "¿Qué gas forma la mayor parte del aire?", response: "nitrógeno" },
        { question: "¿Qué animal pone huevos y da leche?", response: "ornitorrinco" },
        { question: "¿Qué metal se funde a 0°C?", response: "ninguno" },
        { question: "¿Cuál es el continente más grande?", response: "asia" },
        { question: "¿Cuántos días tiene un año bisiesto?", response: "366" },
        { question: "¿Cuál es el símbolo químico del agua?", response: "h2o" },
        { question: "¿Quién escribió 'Cien años de soledad'?", response: "gabriel garcía márquez" },
        { question: "¿Cuál es el deporte más popular del mundo?", response: "fútbol" },
        { question: "¿Qué planeta tiene anillos?", response: "saturno" }
    ];

    // Si ya hay un acertijo activo
    if (id in conn.tekateki) {
        // Verificar respuesta
        const userAnswer = m.text?.toLowerCase()?.trim();
        if (!userAnswer) return;

        if (userAnswer === conn.tekateki[id].answer) {
            await conn.reply(m.chat, `🎉 Correcto! La respuesta es *${conn.tekateki[id].answer}*`, m);
            clearTimeout(conn.tekateki[id].timeout);
            delete conn.tekateki[id];
        }
        return;
    }

    // Elegir un acertijo al azar
    const json = tekateki[Math.floor(Math.random() * tekateki.length)];

    const caption = `
ⷮ🚩 *ACERTIJOS*
✨️ *${json.question}*
⏱️ *Tiempo:* 30 segundos`.trim();

    // Guardar acertijo activo
    conn.tekateki[id] = {
        answer: json.response.toLowerCase().trim(),
        timeout: setTimeout(async () => {
            if (conn.tekateki[id]) {
                await conn.reply(m.chat, `🚩 Se acabó el tiempo!\n*Respuesta:* ${json.response}`, m);
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
handler.register = true;
handler.rowner = false;

export default handler;
