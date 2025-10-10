// plugins/juegos-opciones.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    // Lista de opciones variadas
    const opciones = [
        { name: "Pizza Napolitana", hint: "🍕" },
        { name: "Sushi Mixto", hint: "🍣" },
        { name: "Elefante", hint: "🐘" },
        { name: "Guitarra", hint: "🎸" },
        { name: "Harry Potter", hint: "⚡️" },
        { name: "La Casa de Papel", hint: "🎭" },
        { name: "Tacos Picantes", hint: "🌮" },
        { name: "Star Wars", hint: "🌌" },
        { name: "Perro", hint: "🐶" },
        { name: "Panda", hint: "🐼" },
        { name: "Coche de carreras", hint: "🏎️" },
        { name: "Avión", hint: "✈️" },
        { name: "Corazón", hint: "❤️" },
        { name: "Iron Man", hint: "🤖" },
        { name: "El Señor de los Anillos", hint: "💍" },
        { name: "Frase: Carpe Diem", hint: "⌛️" },
        { name: "Chocolate", hint: "🍫" },
        { name: "Plátano", hint: "🍌" },
        { name: "Gato", hint: "🐱" },
        { name: "Reloj", hint: "⏰" }
    ];

    // Elegir opción correcta
    const correct = opciones[Math.floor(Math.random() * opciones.length)];

    // Mezclar opciones
    let choices = [correct.name];
    while (choices.length < 4) {
        const opt = opciones[Math.floor(Math.random() * opciones.length)].name;
        if (!choices.includes(opt)) choices.push(opt);
    }
    choices = choices.sort(() => Math.random() - 0.5);

    // Guardar partida en global con toda la info necesaria
    if (!global.variosGame) global.variosGame = {};
    global.variosGame[m.chat] = {
        answer: correct.name,
        hint: correct.hint,
        options: choices,
        timeout: setTimeout(async () => {
            const game = global.variosGame?.[m.chat];
            if (game?.answer) {
                const msgs = ['💀 Se te acabó el tiempo!', '🤡 Ni lo intentaste!', '😹 Patético, era', '🫠 Sos un desastre!'];
                await conn.sendMessage(m.chat, { text: `${msgs[Math.floor(Math.random() * msgs.length)]} *${game.answer}* ${game.hint}` }, { quoted: m });
                delete global.variosGame[m.chat];
            }
        }, 30000)
    };

    // Mensaje inicial
    let text = `🎲 *Adivina la opción correcta*:\n\n${correct.hint}\nOpciones:`;
    choices.forEach((o,i)=> text += `\n${i+1}. ${o}`);
    text += `\n\nResponde con el número o el nombre correcto. Tienes 30 segundos!`;

    await conn.sendMessage(m.chat, { text }, { quoted: m });
};

handler.command = ['plato', 'opcion', 'varios'];
handler.tags = ['juegos'];
handler.group = true;

handler.before = async (m, { conn }) => {
    const game = global.variosGame?.[m.chat];
    if (!game?.answer || !m?.text) return;

    const normalizedUser = m.text.replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
    const normalizedAnswer = game.answer.replace(/[^a-zA-Z0-9]/g,'').toLowerCase();

    // Comprobar si respondió con número
    const index = parseInt(m.text);
    let chosen = '';
    if (!isNaN(index) && index >= 1 && index <= game.options.length) {
        chosen = game.options[index-1].replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
    } else {
        chosen = normalizedUser;
    }

    if (chosen === normalizedAnswer) {
        clearTimeout(game.timeout);
        await conn.sendMessage(m.chat, { text: `✅ Correcto! Era *${game.answer}* ${game.hint} 🎉` }, { quoted: m });
        delete global.variosGame[m.chat];
    } else {
        const insults = ['❌ Fallaste!', '🙃 Casi, pero no!', '🤔 Intentá de nuevo!', '😹 No era esa!', '💀 Sos un desastre!'];
        await conn.sendMessage(m.chat, { text: insults[Math.floor(Math.random()*insults.length)] }, { quoted: m });
    }
};

export default handler;
