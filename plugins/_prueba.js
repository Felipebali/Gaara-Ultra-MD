import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};

    // Validar si NSFW está activado
    if (m.isGroup && !chat.nsfw) return m.reply('❌ Los comandos NSFW están desactivados en este chat.');

    try {
        // Endpoints NSFW confiables
        const endpoints = [
            'https://nekos.life/api/v2/img/kuni',
            'https://nekos.life/api/v2/img/pussy',
            'https://nekos.life/api/v2/img/blowjob',
            'https://nekos.life/api/v2/img/anal',
            'https://nekos.life/api/v2/img/tits',
            'https://nekos.life/api/v2/img/femdom'
        ];

        // Elegir endpoint aleatorio
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

        // Intentar 3 veces para obtener URL válida
        let url = null;
        for (let i = 0; i < 3; i++) {
            const api = await fetch(endpoint);
            const res = await api.json();
            if (res.url) { url = res.url; break; }
        }
        if (!url) throw new Error('No se encontró URL válida después de 3 intentos.');

        // Descargar imagen/GIF a buffer
        const response = await fetch(url);
        const buffer = Buffer.from(await response.arrayBuffer());

        // Guardar temporal
        const tmpPath = path.join('/data/data/com.termux/files/home/Gaara-Ultra-MD/tmp', 'ultra.png');
        fs.writeFileSync(tmpPath, buffer);

        // Frases turbias aleatorias
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

        // Enviar imagen/GIF + frase
        await conn.sendMessage(m.chat, {
            image: fs.readFileSync(tmpPath),
            caption: frase
        }, { quoted: m });

        // Reacción 🔥
        await conn.sendMessage(m.chat, {
            react: { text: '🔥', key: m.key }
        });

        // Borrar archivo temporal
        fs.unlinkSync(tmpPath);

    } catch (error) {
        console.error(error);
        m.reply("❌ Error al obtener contenido NSFW. Intenta de nuevo más tarde.");
    }
};

handler.help = ['ultra'];
handler.tags = ['nsfw'];
handler.command = /^ultra$/i;

export default handler;
