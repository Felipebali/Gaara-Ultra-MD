// plugins/cum.js
import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    // Verifica si NSFW está activado en este grupo
    if (m.isGroup && !db.data.chats[m.chat].nsfw) {
        return m.reply('❌ El contenido NSFW está desactivado en este grupo.\n> Solo un owner puede activarlo con *.nsfw*');
    }

    try {
        // Llamada a waifu.pics para gifs NSFW tipo "cum"
        const res = await fetch('https://api.waifu.pics/nsfw/cum');
        const json = await res.json();
        const url = json.url;

        // Enviar el video/gif
        await conn.sendMessage(m.chat, {
            video: { url: url },
            gifPlayback: true,
            caption: '💦 Aquí tienes tu gif de cum!'
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply('❌ Error al obtener el gif. Intenta de nuevo más tarde.');
    }
};

handler.help = ['cum'];
handler.tags = ['nsfw'];
handler.command = ['cum'];
handler.group = true;

export default handler;
