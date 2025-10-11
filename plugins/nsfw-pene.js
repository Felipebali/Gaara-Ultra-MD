import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};

    // Validar si NSFW está activado en el chat
    if (m.isGroup && !chat.nsfw) {
        return m.reply('❌ Los comandos NSFW están desactivados en este chat.');
    }

    try {
        // Endpoint de Nekos.life para NSFW PENE
        const endpoint = 'https://nekos.life/api/v2/img/pussy';

        // Retry 3 veces si la URL viene vacía
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

        // Frases turbias aleatorias
        const frases = [
            "🔥 Mirá esto y dejate llevar 🍆",
            "💦 Que rico, sentí cada movimiento",
            "😈 No mires, solo disfrutá esto",
            "🍑 Más profundo, no pares ahora",
            "😏 Cada segundo que veas esto te excitará",
            "💦 Trágalo despacio, dejate llevar",
            "🔥 Dejá que cada parte de tu cuerpo sienta esto",
            "😈 No vas a poder escapar de esto"
        ];
        const frase = frases[Math.floor(Math.random() * frases.length)];

        // Mandar mensaje con imagen/GIF + frase
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: frase
        }, { quoted: m });

        // Reacción con 🍆
        await conn.sendMessage(m.chat, {
            react: { text: '🍆', key: m.key }
        });

    } catch (err) {
        console.error(err);
        m.reply('❌ Error al obtener contenido NSFW. Intenta de nuevo más tarde.');
    }
};

handler.help = ['pene'];
handler.tags = ['nsfw'];
handler.command = /^pene$/i;

export default handler;
