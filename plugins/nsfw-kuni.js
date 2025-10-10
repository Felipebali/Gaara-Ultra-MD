import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};

    if (m.isGroup && !chat.nsfw) return m.reply('❌ Los comandos NSFW están desactivados en este chat.');

    try {
        const endpoints = [
            'https://api.waifu.pics/nsfw/kuni',
            'https://api.waifu.pics/nsfw/pussy',
            'https://api.waifu.pics/nsfw/anal',
            'https://api.waifu.pics/nsfw/blowjob',
            'https://api.waifu.pics/nsfw/femdom',
            'https://api.waifu.pics/nsfw/tits'
        ];

        const urlAPI = endpoints[Math.floor(Math.random() * endpoints.length)];
        const api = await fetch(urlAPI);
        const res = await api.json();

        if (!res.url) {
            throw new Error('No se encontró una URL de imagen válida.');
        }

        // Descargar la imagen/GIF a buffer
        const imgBuffer = await (await fetch(res.url)).arrayBuffer();

        const frases = [
            "Dejá que te domine, disfrutalo sin pensar 💦",
            "Que rico, sentí cada movimiento 😈",
            "No mires, solo sentite atrapado por esto 🍑",
            "Más profundo, no pares ahora 🔥",
            "Cada segundo que veas esto te excitará 😏",
            "No vas a poder escapar de esto 😈",
            "Abre bien los ojos y disfrutá este momento 🔥",
            "Tragalo despacio, dejate llevar 😏",
            "Dejá que cada parte de tu cuerpo sienta esto 🍆",
            "No mires, solo dejate atrapar por el placer 💦"
        ];

        const frase = frases[Math.floor(Math.random() * frases.length)];

        // Mandar mensaje usando buffer
        await conn.sendMessage(m.chat, {
            image: Buffer.from(imgBuffer),
            caption: frase
        }, { quoted: m });

        // Reacción con 🍆
        await conn.sendMessage(m.chat, {
            react: { text: '🍆', key: m.key }
        });

    } catch (error) {
        console.error(error);
        m.reply("❌ Error al obtener contenido NSFW. Intenta de nuevo más tarde.");
    }
};

handler.help = ['kuni'];
handler.tags = ['nsfw'];
handler.command = /^kuni$/i;

export default handler;
