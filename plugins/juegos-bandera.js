// plugins/juegos-bandera.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    const flags = [
        { name: "Uruguay", emoji: "🇺🇾" }, { name: "Argentina", emoji: "🇦🇷" },
        { name: "Brasil", emoji: "🇧🇷" }, { name: "Chile", emoji: "🇨🇱" },
        { name: "México", emoji: "🇲🇽" }, { name: "España", emoji: "🇪🇸" },
        { name: "Japón", emoji: "🇯🇵" }, { name: "Francia", emoji: "🇫🇷" },
        { name: "Alemania", emoji: "🇩🇪" }, { name: "Italia", emoji: "🇮🇹" },
        { name: "Estados Unidos", emoji: "🇺🇸" }, { name: "Canadá", emoji: "🇨🇦" },
        { name: "Reino Unido", emoji: "🇬🇧" }, { name: "India", emoji: "🇮🇳" },
        { name: "China", emoji: "🇨🇳" }, { name: "Rusia", emoji: "🇷🇺" },
        { name: "Portugal", emoji: "🇵🇹" }, { name: "Países Bajos", emoji: "🇳🇱" },
        { name: "Grecia", emoji: "🇬🇷" }, { name: "Bélgica", emoji: "🇧🇪" },
        { name: "Suiza", emoji: "🇨🇭" }, { name: "Suecia", emoji: "🇸🇪" },
        { name: "Noruega", emoji: "🇳🇴" }, { name: "Finlandia", emoji: "🇫🇮" },
        { name: "Dinamarca", emoji: "🇩🇰" }, { name: "Polonia", emoji: "🇵🇱" },
        { name: "Turquía", emoji: "🇹🇷" }, { name: "Corea del Sur", emoji: "🇰🇷" },
        { name: "Corea del Norte", emoji: "🇰🇵" }, { name: "Tailandia", emoji: "🇹🇭" },
        { name: "Malasia", emoji: "🇲🇾" }, { name: "Indonesia", emoji: "🇮🇩" },
        { name: "Filipinas", emoji: "🇵🇭" }, { name: "Vietnam", emoji: "🇻🇳" },
        { name: "Australia", emoji: "🇦🇺" }, { name: "Nueva Zelanda", emoji: "🇳🇿" },
        { name: "Sudáfrica", emoji: "🇿🇦" }, { name: "Nigeria", emoji: "🇳🇬" },
        { name: "Egipto", emoji: "🇪🇬" }, { name: "Marruecos", emoji: "🇲🇦" },
        { name: "Camerún", emoji: "🇨🇲" }, { name: "Jamaica", emoji: "🇯🇲" },
        { name: "Cuba", emoji: "🇨🇺" }, { name: "Venezuela", emoji: "🇻🇪" },
        { name: "Colombia", emoji: "🇨🇴" }, { name: "Perú", emoji: "🇵🇪" },
        { name: "Bolivia", emoji: "🇧🇴" }, { name: "Paraguay", emoji: "🇵🇾" },
        { name: "Ecuador", emoji: "🇪🇨" }, { name: "Honduras", emoji: "🇭🇳" },
        { name: "Singapur", emoji: "🇸🇬" }, { name: "Noruega", emoji: "🇳🇴" },
        { name: "Islandia", emoji: "🇮🇸" }, { name: "Luxemburgo", emoji: "🇱🇺" },
        { name: "Irlanda", emoji: "🇮🇪" }, { name: "Hungría", emoji: "🇭🇺" },
        { name: "Pakistán", emoji: "🇵🇰" }, { name: "Bangladesh", emoji: "🇧🇩" }
    ];

    // Elegir país aleatorio
    const correct = flags[Math.floor(Math.random() * flags.length)];

    // Mezclar opciones
    let options = [correct.name];
    while (options.length < 4) {
        const opt = flags[Math.floor(Math.random() * flags.length)].name;
        if (!options.includes(opt)) options.push(opt);
    }
    options = options.sort(() => Math.random() - 0.5);

    // Guardar en memoria
    if (!global.flagGame) global.flagGame = {};
    global.flagGame[m.chat] = {
        answer: correct.name,
        timeout: setTimeout(async () => {
            const game = global.flagGame?.[m.chat];
            if (game?.answer) {
                const insults = [
                    '💀 Sos un inútil total!',
                    '🤡 Ni siquiera lo intentaste!',
                    '😹 Patético, la respuesta era',
                    '🫠 Sos un desastre, era'
                ];
                const msg = insults[Math.floor(Math.random() * insults.length)];
                await conn.sendMessage(m.chat, { text: `${msg} *${correct.name}* ${correct.emoji}` }, { quoted: m });
                delete global.flagGame[m.chat];
            }
        }, 30000)
    };

    let text = `🌍 *Adivina la bandera*:\n\n${correct.emoji}\n\nOpciones:`;
    options.forEach((o, i) => text += `\n${i + 1}. ${o}`);
    text += `\n\nResponde con el número o el nombre de la opción correcta. Tienes 30 segundos!`;

    await conn.sendMessage(m.chat, { text }, { quoted: m });
};

handler.command = ['bandera', 'flags', 'flag'];
handler.help = ['bandera'];
handler.tags = ['juegos'];
handler.group = false;

handler.before = async (m, { conn }) => {
    const game = global.flagGame?.[m.chat];
    if (!game?.answer || !m?.text) return;

    const normalizedUser = m.text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const normalizedAnswer = game.answer.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (normalizedUser === normalizedAnswer) {
        clearTimeout(game.timeout);
        await conn.sendMessage(m.chat, { text: `✅ Correcto! La bandera es de *${game.answer}* 🎉` }, { quoted: m });
        delete global.flagGame[m.chat];
    } else {
        const insults = [
            '❌ Dale boludo, vos podés o sos inútil? 😅',
            '🙃 Casi, pero no es esa!',
            '🤔 Intentá de nuevo, campeón!',
            '😬 Nooo, fijate bien!',
            '💀 Sos un desastre total!',
            '🤡 Sos peor que un bot fallando!'
        ];
        await conn.sendMessage(m.chat, { text: insults[0] }, { quoted: m });
    }
};

export default handler;
