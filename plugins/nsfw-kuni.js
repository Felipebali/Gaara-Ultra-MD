import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};

    // Comprobar si NSFW está activado
    if (m.isGroup && !chat.nsfw) {
        return m.reply('❌ Los comandos NSFW están desactivados en este chat.');
    }

    try {
        // Array de endpoints hentai (Kuni + similares)
        const endpoints = [
            'https://api.waifu.pics/nsfw/kuni',
            'https://api.waifu.pics/nsfw/pussy',
            'https://api.waifu.pics/nsfw/anal',
            'https://api.waifu.pics/nsfw/blowjob',
            'https://api.waifu.pics/nsfw/femdom',
            'https://api.waifu.pics/nsfw/tits'
        ];

        // Elegir uno al azar
        const urlAPI = endpoints[Math.floor(Math.random() * endpoints.length)];
        const api = await fetch(urlAPI);
        const res = await api.json();

        // Frases turbias hardcore aleatorias
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

        // Mandar mensaje con imagen/GIF + frase
        await conn.sendMessage(m.chat, {
            image: { url: res.url },
            caption: frase
        }, { quoted: m });

        // Reacción con emoji 🍆
        await conn.sendMessage(m.chat, {
            react: {
                text: '🍆',
                key: m.key
            }
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
