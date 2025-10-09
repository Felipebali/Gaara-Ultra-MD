// plugins/acertijo.js
const timeout = 30000; // 30 segundos

const handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};

    // Revisar si los juegos están activados
    if (!chatSettings.games) {
        return conn.reply(m.chat, '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.', m);
    }

    conn.tekateki = conn.tekateki || {};
    const id = m.chat;

    if (id in conn.tekateki) {
        conn.reply(m.chat, '⚠️ Todavía hay acertijos sin responder en este chat', conn.tekateki[id][0]);
        throw false;
    }

    // Lista de 30 acertijos directamente en el código
    const tekateki = [
        { question: "¿Cuál es la capital de Francia?", response: "París" },
        { question: "¿2 + 2?", response: "4" },
        { question: "¿Qué planeta es conocido como el planeta rojo?", response: "Marte" },
        { question: "¿Cuál es el río más largo del mundo?", response: "Nilo" },
        { question: "¿Quién escribió 'Romeo y Julieta'?", response: "Shakespeare" },
        { question: "¿En qué año llegó el hombre a la luna?", response: "1969" },
        { question: "¿Cuál es el animal más rápido del mundo?", response: "Guepardo" },
        { question: "¿Qué gas necesitamos para respirar?", response: "Oxígeno" },
        { question: "¿Cuál es la moneda de Japón?", response: "Yen" },
        { question: "¿Cuál es la montaña más alta del mundo?", response: "Everest" },
        { question: "¿Qué idioma se habla en Brasil?", response: "Portugués" },
        { question: "¿Qué instrumento tiene teclas blancas y negras?", response: "Piano" },
        { question: "¿Cuál es el océano más grande?", response: "Pacífico" },
        { question: "¿Cuál es el símbolo químico del oro?", response: "Au" },
        { question: "¿Qué animal es conocido como el rey de la selva?", response: "León" },
        { question: "¿Cuántos colores tiene el arcoíris?", response: "7" },
        { question: "¿Quién pintó la Mona Lisa?", response: "Da Vinci" },
        { question: "¿Qué instrumento se usa para medir la temperatura?", response: "Termómetro" },
        { question: "¿Cuál es el planeta más grande del sistema solar?", response: "Júpiter" },
        { question: "¿Cómo se llama el satélite de la Tierra?", response: "Luna" },
        { question: "¿Cuál es el país con la mayor población?", response: "China" },
        { question: "¿Qué gas forma la mayor parte del aire?", response: "Nitrógeno" },
        { question: "¿Qué animal pone huevos y da leche?", response: "Ornitorrinco" },
        { question: "¿Qué metal se funde a 0°C?", response: "Ninguno" },
        { question: "¿Cuál es el continente más grande?", response: "Asia" },
        { question: "¿Cuántos días tiene un año bisiesto?", response: "366" },
        { question: "¿Cuál es el símbolo químico del agua?", response: "H2O" },
        { question: "¿Quién escribió 'Cien años de soledad'?", response: "Gabriel García Márquez" },
        { question: "¿Cuál es el deporte más popular del mundo?", response: "Fútbol" },
        { question: "¿Qué planeta tiene anillos?", response: "Saturno" }
    ];

    const json = tekateki[Math.floor(Math.random() * tekateki.length)];

    const caption = `
ⷮ🚩 *ACERTIJOS*
✨️ *${json.question}*

⏱️ *Tiempo:* ${(timeout / 1000).toFixed(0)} segundos`.trim();

    conn.tekateki[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        setTimeout(async () => {
            if (conn.tekateki[id]) {
                await conn.reply(m.chat, `🚩 Se acabó el tiempo!\n*Respuesta:* ${json.response}`, conn.tekateki[id][0]);
            }
            delete conn.tekateki[id];
        }, timeout)
    ];
};

handler.help = ['acertijo'];
handler.tags = ['game'];
handler.command = ['acertijo', 'acert', 'tekateki'];
handler.group = true;

export default handler;
