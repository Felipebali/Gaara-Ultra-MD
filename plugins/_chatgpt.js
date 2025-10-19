// plugins/ia-free.js
import fetch from 'node-fetch';

let cooldowns = {}; // Evitar spam

let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, '❌ Escribe tu pregunta. Ej: .ia ¿Hola?', m);

    const senderTag = '@' + m.sender.split('@')[0];

    // Cooldown 10 segundos por usuario
    const now = Date.now();
    if (cooldowns[m.sender] && now - cooldowns[m.sender] < 10000) {
        return conn.reply(m.chat, `⏳ Espera unos segundos antes de preguntar de nuevo, ${senderTag}.`, m);
    }
    cooldowns[m.sender] = now;

    const thinking = await conn.sendMessage(m.chat, { text: `🤖 ${senderTag}, procesando tu pregunta...` }, { quoted: m });

    try {
        const res = await fetch(`https://some-random-api.ml/chatbot?message=${encodeURIComponent(text)}`);
        const data = await res.json();
        const answer = data.response || '❌ No pude generar una respuesta.';

        await conn.sendMessage(m.chat, {
            text: `💬 ${senderTag}\n\n${answer}`
        }, { quoted: m });

    } catch (err) {
        console.log(err);
        await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al procesar tu solicitud.' }, { quoted: m });
    }
};

handler.help = ['ia <pregunta>'];
handler.tags = ['ai', 'fun'];
handler.command = ['ia'];
handler.register = true;

export default handler;
