// plugins/juegos-bandera.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa *.juegos* para activarlos.' }, { quoted: m });
    }

    const flags = [
        // América
        { name: "Argentina", emoji: "🇦🇷" }, { name: "Bolivia", emoji: "🇧🇴" },
        { name: "Brasil", emoji: "🇧🇷" }, { name: "Canadá", emoji: "🇨🇦" },
        { name: "Chile", emoji: "🇨🇱" }, { name: "Colombia", emoji: "🇨🇴" },
        { name: "Cuba", emoji: "🇨🇺" }, { name: "Ecuador", emoji: "🇪🇨" },
        { name: "Estados Unidos", emoji: "🇺🇸" }, { name: "Honduras", emoji: "🇭🇳" },
        { name: "Jamaica", emoji: "🇯🇲" }, { name: "México", emoji: "🇲🇽" },
        { name: "Paraguay", emoji: "🇵🇾" }, { name: "Perú", emoji: "🇵🇪" },
        { name: "Uruguay", emoji: "🇺🇾" }, { name: "Venezuela", emoji: "🇻🇪" },
        { name: "Guatemala", emoji: "🇬🇹" }, { name: "El Salvador", emoji: "🇸🇻" },
        { name: "Panamá", emoji: "🇵🇦" }, { name: "República Dominicana", emoji: "🇩🇴" },
        { name: "Costa Rica", emoji: "🇨🇷" }, { name: "Haití", emoji: "🇭🇹" },
        { name: "Belice", emoji: "🇧🇿" }, { name: "Trinidad y Tobago", emoji: "🇹🇹" },
        { name: "Surinam", emoji: "🇸🇷" },

        // Europa
        { name: "Alemania", emoji: "🇩🇪" }, { name: "Andorra", emoji: "🇦🇩" },
        { name: "Austria", emoji: "🇦🇹" }, { name: "Bélgica", emoji: "🇧🇪" },
        { name: "Bielorrusia", emoji: "🇧🇾" }, { name: "Bosnia y Herzegovina", emoji: "🇧🇦" },
        { name: "Bulgaria", emoji: "🇧🇬" }, { name: "Chipre", emoji: "🇨🇾" },
        { name: "Croacia", emoji: "🇭🇷" }, { name: "Dinamarca", emoji: "🇩🇰" },
        { name: "Eslovaquia", emoji: "🇸🇰" }, { name: "Eslovenia", emoji: "🇸🇮" },
        { name: "España", emoji: "🇪🇸" }, { name: "Estonia", emoji: "🇪🇪" },
        { name: "Finlandia", emoji: "🇫🇮" }, { name: "Francia", emoji: "🇫🇷" },
        { name: "Grecia", emoji: "🇬🇷" }, { name: "Hungría", emoji: "🇭🇺" },
        { name: "Irlanda", emoji: "🇮🇪" }, { name: "Islandia", emoji: "🇮🇸" },
        { name: "Italia", emoji: "🇮🇹" }, { name: "Letonia", emoji: "🇱🇻" },
        { name: "Lituania", emoji: "🇱🇹" }, { name: "Luxemburgo", emoji: "🇱🇺" },
        { name: "Malta", emoji: "🇲🇹" }, { name: "Moldavia", emoji: "🇲🇩" },
        { name: "Mónaco", emoji: "🇲🇨" }, { name: "Noruega", emoji: "🇳🇴" },
        { name: "Países Bajos", emoji: "🇳🇱" }, { name: "Polonia", emoji: "🇵🇱" },
        { name: "Portugal", emoji: "🇵🇹" }, { name: "Reino Unido", emoji: "🇬🇧" },
        { name: "Rumania", emoji: "🇷🇴" }, { name: "Rusia", emoji: "🇷🇺" },
        { name: "Serbia", emoji: "🇷🇸" }, { name: "Suecia", emoji: "🇸🇪" },
        { name: "Suiza", emoji: "🇨🇭" }, { name: "Ucrania", emoji: "🇺🇦" },

        // Asia
        { name: "Arabia Saudita", emoji: "🇸🇦" }, { name: "Armenia", emoji: "🇦🇲" },
        { name: "Azerbaiyán", emoji: "🇦🇿" }, { name: "Bangladesh", emoji: "🇧🇩" },
        { name: "Camboya", emoji: "🇰🇭" }, { name: "China", emoji: "🇨🇳" },
        { name: "Corea del Norte", emoji: "🇰🇵" }, { name: "Corea del Sur", emoji: "🇰🇷" },
        { name: "Emiratos Árabes Unidos", emoji: "🇦🇪" }, { name: "Filipinas", emoji: "🇵🇭" },
        { name: "Georgia", emoji: "🇬🇪" }, { name: "India", emoji: "🇮🇳" },
        { name: "Indonesia", emoji: "🇮🇩" }, { name: "Irán", emoji: "🇮🇷" },
        { name: "Irak", emoji: "🇮🇶" }, { name: "Israel", emoji: "🇮🇱" },
        { name: "Japón", emoji: "🇯🇵" }, { name: "Jordania", emoji: "🇯🇴" },
        { name: "Kazajistán", emoji: "🇰🇿" }, { name: "Kirguistán", emoji: "🇰🇬" },
        { name: "Laos", emoji: "🇱🇦" }, { name: "Líbano", emoji: "🇱🇧" },
        { name: "Malasia", emoji: "🇲🇾" }, { name: "Mongolia", emoji: "🇲🇳" },
        { name: "Nepal", emoji: "🇳🇵" }, { name: "Pakistán", emoji: "🇵🇰" },
        { name: "Qatar", emoji: "🇶🇦" }, { name: "Singapur", emoji: "🇸🇬" },
        { name: "Siria", emoji: "🇸🇾" }, { name: "Tailandia", emoji: "🇹🇭" },
        { name: "Turquía", emoji: "🇹🇷" }, { name: "Vietnam", emoji: "🇻🇳" },
        { name: "Yemen", emoji: "🇾🇪" },

        // África
        { name: "Angola", emoji: "🇦🇴" }, { name: "Argelia", emoji: "🇩🇿" },
        { name: "Camerún", emoji: "🇨🇲" }, { name: "Congo", emoji: "🇨🇬" },
        { name: "Egipto", emoji: "🇪🇬" }, { name: "Etiopía", emoji: "🇪🇹" },
        { name: "Ghana", emoji: "🇬🇭" }, { name: "Kenia", emoji: "🇰🇪" },
        { name: "Marruecos", emoji: "🇲🇦" }, { name: "Mozambique", emoji: "🇲🇿" },
        { name: "Namibia", emoji: "🇳🇦" }, { name: "Nigeria", emoji: "🇳🇬" },
        { name: "Senegal", emoji: "🇸🇳" }, { name: "Sudáfrica", emoji: "🇿🇦" },
        { name: "Tanzania", emoji: "🇹🇿" }, { name: "Túnez", emoji: "🇹🇳" },
        { name: "Uganda", emoji: "🇺🇬" }, { name: "Zambia", emoji: "🇿🇲" },
        { name: "Zimbabue", emoji: "🇿🇼" },

        // Oceanía
        { name: "Australia", emoji: "🇦🇺" }, { name: "Fiyi", emoji: "🇫🇯" },
        { name: "Nueva Zelanda", emoji: "🇳🇿" }, { name: "Papúa Nueva Guinea", emoji: "🇵🇬" },
        { name: "Samoa", emoji: "🇼🇸" }, { name: "Tonga", emoji: "🇹🇴" },
        { name: "Islas Salomón", emoji: "🇸🇧" }, { name: "Vanuatu", emoji: "🇻🇺" }
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
        answer: correct.name,
        answered: false,
        timeout: setTimeout(async () => {
            const game = global.flagGame?.[m.chat];
            if (game && !game.answered) {
                const msgs = [
                    '💀 Sos un inútil total!',
                    '🤡 Ni siquiera lo intentaste!',
                    '😹 Patético, la respuesta era',
                    '🫠 Sos un desastre, era'
                ];
                await conn.sendMessage(m.chat, { text: `${msgs[Math.floor(Math.random() * msgs.length)]} *${correct.name}* ${correct.emoji}` }, { quoted: m });
                delete global.flagGame[m.chat];
            }
        }, 30000)
    };

    let text = `🌍 *Adivina la bandera*:\n\n${correct.emoji}\n\nOpciones:`;
    options.forEach((o, i) => text += `\n${i + 1}. ${o}`);
    text += `\n\nResponde con el número o el nombre correcto.\n⏱️ *Tienes 30 segundos!*`;

    await conn.sendMessage(m.chat, { text }, { quoted: m });
};

handler.before = async (m, { conn }) => {
    const game = global.flagGame?.[m.chat];
    if (!game || game.answered || !m.text) return;

    const normalizedUser = m.text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const normalizedAnswer = game.answer.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (normalizedUser === normalizedAnswer) {
        clearTimeout(game.timeout);
        game.answered = true;
        await conn.sendMessage(m.chat, { text: `✅ Correcto! Era *${game.answer}* ${game.answer.emoji || ''} 🎉` }, { quoted: m });
        delete global.flagGame[m.chat];
    } else {
        const msgs = [
            '❌ No, esa no es!',
            '🤔 Casi casi...',
            '🙃 Esa no, probá otra!',
            '😬 Incorrecto!',
            '💀 Sos un desastre total!'
        ];
        await conn.sendMessage(m.chat, { text: msgs[Math.floor(Math.random() * msgs.length)] }, { quoted: m });
    }
};

handler.command = ['bandera', 'flags', 'flag'];
handler.help = ['bandera'];
handler.tags = ['juegos'];
handler.group = false;

export default handler;
