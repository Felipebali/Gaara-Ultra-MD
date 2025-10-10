import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix }) => {
    let chat = global.db.data.chats[m.chat] || {};

    // Validación NSFW
    if (m.isGroup && !chat.nsfw) {
        return m.reply(`🔞 *Contenido NSFW desactivado*\nUn administrador puede activarlo con:\n\`${usedPrefix}nsfw on\``);
    }

    try {
        // Array de endpoints hentai (imágenes + GIFs)
        let endpoints = [
            'https://api.waifu.pics/nsfw/waifu',
            'https://api.waifu.pics/nsfw/nekopara',
            'https://api.waifu.pics/nsfw/neko',
            'https://api.waifu.pics/nsfw/kuni',
            'https://api.waifu.pics/nsfw/blowjob',
        ];

        // Elegir uno al azar
        let urlAPI = endpoints[Math.floor(Math.random() * endpoints.length)];
        let api = await fetch(urlAPI);
        let res = await api.json();

        // Frases turbias aleatorias
        let frases = [
            "Arrodillate y obedecé como buena zorra 😈",
            "Tomá esto despacio, no seas impaciente 😏",
            "Que rico, ¿lo querés así o más profundo? 🔥",
            "No mires, solo sentite atrapado por esto 😈",
            "Mirá bien, esto es solo para tus ojos 🍆",
        ];

        let frase = frases[Math.floor(Math.random() * frases.length)];

        // Mandar mensaje con mención al usuario
        await conn.sendMessage(m.chat, {
            image: { url: res.url },
            caption: `@${m.sender.split('@')[0]} ${frase}`
        }, { quoted: m, mentions: [m.sender] });

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

handler.help = ['pene'];
handler.tags = ['nsfw'];
handler.command = /^pene$/i;

export default handler;
