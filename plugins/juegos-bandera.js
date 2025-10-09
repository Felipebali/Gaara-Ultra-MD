// plugins/banderas.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    const flags = [
        { name: "Uruguay", emoji: "🇺🇾" },
        { name: "Argentina", emoji: "🇦🇷" },
        { name: "Brasil", emoji: "🇧🇷" },
        { name: "Chile", emoji: "🇨🇱" },
        { name: "México", emoji: "🇲🇽" },
        { name: "España", emoji: "🇪🇸" },
        { name: "Japón", emoji: "🇯🇵" },
        { name: "Francia", emoji: "🇫🇷" },
        { name: "Alemania", emoji: "🇩🇪" },
        { name: "Italia", emoji: "🇮🇹" },
        { name: "Estados Unidos", emoji: "🇺🇸" },
        { name: "Canadá", emoji: "🇨🇦" },
        { name: "Reino Unido", emoji: "🇬🇧" },
        { name: "India", emoji: "🇮🇳" },
        { name: "China", emoji: "🇨🇳" },
        { name: "Rusia", emoji: "🇷🇺" },
        { name: "Portugal", emoji: "🇵🇹" },
        { name: "Países Bajos", emoji: "🇳🇱" },
        { name: "Grecia", emoji: "🇬🇷" },
        { name: "Bélgica", emoji: "🇧🇪" },
        { name: "Suiza", emoji: "🇨🇭" },
        { name: "Suecia", emoji: "🇸🇪" },
        { name: "Noruega", emoji: "🇳🇴" },
        { name: "Finlandia", emoji: "🇫🇮" },
        { name: "Dinamarca", emoji: "🇩🇰" },
        { name: "Polonia", emoji: "🇵🇱" },
        { name: "Turquía", emoji: "🇹🇷" },
        { name: "Corea del Sur", emoji: "🇰🇷" },
        { name: "Corea del Norte", emoji: "🇰🇵" },
        { name: "Tailandia", emoji: "🇹🇭" },
        { name: "Malasia", emoji: "🇲🇾" },
        { name: "Indonesia", emoji: "🇮🇩" },
        { name: "Filipinas", emoji: "🇵🇭" },
        { name: "Vietnam", emoji: "🇻🇳" },
        { name: "Australia", emoji: "🇦🇺" },
        { name: "Nueva Zelanda", emoji: "🇳🇿" },
        { name: "Sudáfrica", emoji: "🇿🇦" },
        { name: "Nigeria", emoji: "🇳🇬" },
        { name: "Egipto", emoji: "🇪🇬" },
        { name: "Marruecos", emoji: "🇲🇦" },
        { name: "Camerún", emoji: "🇨🇲" },
        { name: "Jamaica", emoji: "🇯🇲" },
        { name: "Cuba", emoji: "🇨🇺" },
        { name: "Venezuela", emoji: "🇻🇪" },
        { name: "Colombia", emoji: "🇨🇴" },
        { name: "Perú", emoji: "🇵🇪" },
        { name: "Bolivia", emoji: "🇧🇴" },
        { name: "Paraguay", emoji: "🇵🇾" },
        { name: "Ecuador", emoji: "🇪🇨" },
        { name: "Honduras", emoji: "🇭🇳" },
        { name: "Singapur", emoji: "🇸🇬" },
        { name: "Emiratos Árabes", emoji: "🇦🇪" },
        { name: "Arabia Saudita", emoji: "🇸🇦" },
        { name: "Irán", emoji: "🇮🇷" },
        { name: "Iraq", emoji: "🇮🇶" },
        { name: "Pakistán", emoji: "🇵🇰" },
        { name: "Bangladesh", emoji: "🇧🇩" },
        { name: "Islandia", emoji: "🇮🇸" },
        { name: "Luxemburgo", emoji: "🇱🇺" }
    ];

    const correct = flags[Math.floor(Math.random() * flags.length)];

    let options = [correct.name];
    while (options.length < 4) {
        const opt = flags[Math.floor(Math.random() * flags.length)].name;
        if (!options.includes(opt)) options.push(opt);
    }
    options = options.sort(() => Math.random() - 0.5);

    if (!global.flagGame) global.flagGame = {};
    global.flagGame[m.chat] = {
        answer: correct.name?.toLowerCase() || null,
        timeout: setTimeout(async () => {
            if (global.flagGame[m.chat]?.answer) {
                const insultMessages = [
                    '💀 Sos un desastre, te gané el tiempo!',
                    '😹 Inútil, no respondiste a tiempo!',
                    '🤡 Qué desastre, la respuesta era',
                    '🫠 Ni cerca! Era'
                ];
                const msg = insultMessages[Math.floor(Math.random() * insultMessages.length)];
                await conn.sendMessage(m.chat, { text: `${msg} *${correct.name}* ${correct.emoji}` }, { quoted: m });
                delete global.flagGame[m.chat];
            }
        }, 30000)
    };

    let text = `🌍 *Adivina la bandera*:\n\n${correct.emoji}\n\nOpciones:`;
    options.forEach((o, i) => text += `\n${i + 1}. ${o}`);
    text += `\n\nResponde con el número o el nombre de la opción correcta. Tienes 30 segundos!`;

    conn.sendMessage(m.chat, { text }, { quoted: m });
};

handler.command = ['bandera', 'flags', 'flag'];
handler.help = ['bandera'];
handler.tags = ['juegos'];
handler.group = false;

handler.before = async (m, { conn }) => {
    // Protecciones totales
    if (!m?.text) return;
    if (!global.flagGame?.[m.chat]) return;
    const game = global.flagGame[m.chat];
    if (!game?.answer) return;

    const userText = m.text.toString();
    const normalized = userText.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const answerNormalized = game.answer.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (normalized === answerNormalized) {
        clearTimeout(game.timeout);
        await conn.sendMessage(m.chat, { text: `✅ Correcto! La bandera es de *${game.answer}* 🎉` }, { quoted: m });
        delete global.flagGame[m.chat];
    } else {
        const failMessages = [
            '❌ Dale boludo, vos podés o sos inútil? 😅',
            '🙃 Casi, pero no es esa!',
            '🤔 Intentá de nuevo, campeón!',
            '😬 Nooo, fijate bien!'
        ];
        const msg = failMessages[Math.floor(Math.random() * failMessages.length)];
        await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
    }
};

export default handler;
