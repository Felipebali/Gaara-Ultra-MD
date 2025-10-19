// plugins/bot-chatgpt-free.js

import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, '❌ Escribe tu pregunta. Ej: .bot ¿Cómo estás?', m);

    await conn.sendMessage(m.chat, { text: '🤖 Pensando...' }, { quoted: m });

    try {
        const res = await fetch(`https://api.deepseek.ai/chat?message=${encodeURIComponent(text)}&botname=FelixBot&ownername=Feli`);
        const data = await res.json();
        const answer = data.message || '❌ No pude generar una respuesta.';

        await conn.sendMessage(m.chat, { text: answer }, { quoted: m });

    } catch (err) {
        console.log(err);
        await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al procesar tu solicitud.' }, { quoted: m });
    }
};

handler.help = ['bot <pregunta>'];
handler.tags = ['ai', 'fun'];
handler.command = ['bot'];
handler.register = true;

export default handler;
