import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};

    // Comprobar si NSFW está activado
    if (m.isGroup && !chat.nsfw) {
        return m.reply('❌ Los comandos NSFW están desactivados en este chat.');
    }

    try {
        // Array de endpoints hentai hardcore (imágenes + GIFs)
        let endpoints = [
            'https://api.waifu.pics/nsfw/waifu',
            'https://api.waifu.pics/nsfw/blowjob',
            'https://api.waifu.pics/nsfw/pussy',
            'https://api.waifu.pics/nsfw/anal',
            'https://api.waifu.pics/nsfw/kuni',
            'https://api.waifu.pics/nsfw/tits',
            'https://api.waifu.pics/nsfw/femdom'
        ];

        // Elegir uno al azar
        let urlAPI = endpoints[Math.floor(Math.random() * endpoints.length)];
        let api = await fetch(urlAPI);
        let res = await api.json();

        // Frases turbias hardcore aleatorias
        let frases = [
            "Arrodillate y obedecé como buena zorra 😈",
            "Tragalo despacio, no seas impaciente 🔥",
            "Mirá bien, esto es solo para tus ojos 🍆",
            "No mires, solo sentite atrapado por esto 😈",
            "Que rico, ¿lo querés así o más profundo? 😏",
            "Dejá que te domine, disfrutalo sin pensar 💦",
            "Abre bien los ojos y disfrutá este momento 🔥",
            "No vas a poder escapar de esto 😈",
            "Cada segundo que mires, más te vas a excitar 🍑",
        ];

        let frase = frases[Math.floor(Math.random() * frases.length)];

        // Mandar mensaje con imagen/GIF + frase
        await conn.sendMessage(m.chat, {
            image: { url: res.url }, // Funciona para imágenes y GIFs
            caption: frase
        }, { quoted: m });

        // Reacción hardcore con emoji 🍆
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

handler.help = ['pene'];
handler.tags = ['nsfw'];
handler.command = /^pene$/i;

export default handler;
