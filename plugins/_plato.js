// plugins/juegos-plato.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    const platos = [
        { name: "Pizza Napolitana", emoji: "🍕" },
        { name: "Sushi Mixto", emoji: "🍣" },
        { name: "Empanadas Caseras", emoji: "🥟" },
        { name: "Hamburguesa Triple XL", emoji: "🍔" },
        { name: "Sopita para el alma", emoji: "🍜" },
        { name: "Guiso hecho por tu ex", emoji: "🔥" },
        { name: "Sándwich de aire", emoji: "😹" },
        { name: "Puré misterioso", emoji: "💩" },
        { name: "Pasta con salsa radioactiva", emoji: "😈" },
    ];

    // Elegir plato correcto
    const correct = platos[Math.floor(Math.random() * platos.length)];

    // Mezclar opciones
    let options = [correct.name];
    while (options.length < 4) {
        const opt = platos[Math.floor(Math.random() * platos.length)].name;
        if (!options.includes(opt)) options.push(opt);
    }
    options = options.sort(() => Math.random() - 0.5);

    // Guardar en memoria
    if (!global.platoGame) global.platoGame = {};
    global.platoGame[m.chat] = {
        answer: correct.name,
        timeout: setTimeout(async () => {
            const game = global.platoGame?.[m.chat];
            if (game?.answer) {
                const msg = '⏰ Se acabó el tiempo! La respuesta correcta era';
                await conn.sendMessage(m.chat, { text: `${msg} *${correct.name}* ${correct.emoji}` }, { quoted: m });
                delete global.platoGame[m.chat];
            }
        }, 30000)
    };

    let text = `🍽️ *Adivina el plato*:\n\n${correct.emoji}\n\nOpciones:`;
    options.forEach((o, i) => text += `\n${i + 1}. ${o}`);
    text += `\n\nResponde con el número o el nombre del plato correcto. Tienes 30 segundos!`;

    await conn.sendMessage(m.chat, { text }, { quoted: m });
};

handler.command = ['plato'];
handler.help = ['plato'];
handler.tags = ['juegos'];
handler.group = false;

handler.before = async (m, { conn }) => {
    const game = global.platoGame?.[m.chat];
    if (!game?.answer || !m?.text) return;

    const normalizedUser = m.text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const normalizedAnswer = game.answer.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (normalizedUser === normalizedAnswer || m.text === '1' || m.text === '2' || m.text === '3' || m.text === '4') {
        clearTimeout(game.timeout);
        const opciones = Object.keys(game).filter(k => k !== 'timeout');
        await conn.sendMessage(m.chat, { text: `✅ Correcto! El plato era *${game.answer}* 🎉` }, { quoted: m });
        delete global.platoGame[m.chat];
    } else {
        const insults = [
            '❌ Ups, esa no es!',
            '🙃 Casi, pero no es esa!',
            '🤔 Intentá de nuevo!',
            '😬 Nooo, fijate bien!',
            '💀 Fallaste, era otro!'
        ];
        await conn.sendMessage(m.chat, { text: insults[Math.floor(Math.random() * insults.length)] }, { quoted: m });
    }
};

export default handler;
