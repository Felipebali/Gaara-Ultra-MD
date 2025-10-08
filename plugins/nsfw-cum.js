// plugins/nsfw-cum.js
import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    if (m.isGroup && !db.data.chats[m.chat].nsfw) {
        return m.reply('❌ El contenido NSFW está desactivado en este grupo.\n> Solo un owner puede activarlo con *.nsfw*');
    }

    try {
        const res = await fetch('https://api.waifu.pics/nsfw/cum');
        const json = await res.json();
        const url = json.url;

        // Comprobamos extensión
        if (url.endsWith('.mp4') || url.endsWith('.gif')) {
            await conn.sendMessage(m.chat, {
                video: { url },
                gifPlayback: true,
                caption: '💦 Aquí tienes tu gif de cum!'
            }, { quoted: m });
        } else {
            // Si no es video/gif, lo enviamos como imagen
            await conn.sendMessage(m.chat, {
                image: { url },
                caption: '💦 Aquí tienes tu imagen NSFW cum!'
            }, { quoted: m });
        }

    } catch (e) {
        console.error(e);
        m.reply('❌ Error al obtener el contenido NSFW. Intenta de nuevo más tarde.');
    }
};

handler.help = ['cum'];
handler.tags = ['nsfw'];
handler.command = ['cum'];
handler.group = true;

export default handler;
