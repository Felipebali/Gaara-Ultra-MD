// plugins/banderas.js
let handler = async (m, { conn }) => {
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
        { name: "Honduras", emoji: "🇭🇳" }
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

    // Guardar la respuesta correcta en memoria temporal
    if (!global.flagGame) global.flagGame = {};
    global.flagGame[m.chat] = correct.name.toLowerCase();

    // Enviar pregunta
    let text = `🌍 *Adivina la bandera*:\n\n${correct.emoji}\n\nOpciones:`;
    options.forEach((o, i) => text += `\n${i + 1}. ${o}`);
    text += `\n\nResponde con el número de la opción correcta.`;

    conn.sendMessage(m.chat, { text }, { quoted: m });
};

handler.command = ['bandera', 'flags', 'flag'];
handler.help = ['bandera'];
handler.tags = ['juegos'];
handler.group = false;

handler.before = async (m, { conn }) => {
    if (!m.text) return;
    const answer = global.flagGame?.[m.chat];
    if (!answer) return;

    const normalized = m.text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (normalized === answer.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()) {
        await conn.sendMessage(m.chat, { text: `✅ Correcto! La bandera es de *${answer}* 🎉` }, { quoted: m });
        delete global.flagGame[m.chat];
    }
};

export default handler;
