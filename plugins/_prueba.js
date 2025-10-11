import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};

    if (m.isGroup && !chat.nsfw)
        return m.reply('❌ Los comandos NSFW están desactivados en este chat.');

    try {
        // Waifu.im NSFW endpoint
        const res = await fetch('https://api.waifu.im/sfw/waifu/?is_nsfw=true');
        const data = await res.json();

        // Tomar la primera imagen
        const url = data.images?.[0]?.url;
        if (!url) throw new Error('No se encontró una URL válida.');

        // Frases turbias
        const frases = [
            "🔥 Ultra excitante, dejate llevar 🍆",
            "💦 Que rico, sentí cada movimiento 😈",
            "🍑 No mires, solo disfrutá esto 🔥",
            "😏 Cada segundo que veas esto te excitará",
            "😈 Trágalo despacio, dejate llevar",
            "💦 Dejá que cada parte de tu cuerpo sienta esto",
            "🔥 No vas a poder escapar de esto 😏",
            "💥 Todo se vuelve intenso ahora…"
        ];

        const frase = frases[Math.floor(Math.random() * frases.length)];

        await conn.sendMessage(m.chat, { image: { url }, caption: frase }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

    } catch (err) {
        console.error(err);
        m.reply('❌ Error al obtener contenido NSFW. Intenta de nuevo más tarde.');
    }
};

handler.help = ['ultra'];
handler.tags = ['nsfw'];
handler.command = /^ultra$/i;

export default handler;
