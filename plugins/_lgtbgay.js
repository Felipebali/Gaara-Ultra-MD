import axios from 'axios';
import fs from 'fs';
import path from 'path';

const flags = {
    gay: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Gay_pride_flag_2016.png',
    bisexual: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Bisexual_Pride_flag.svg/1024px-Bisexual_Pride_flag.svg.png',
    trans: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Transgender_Pride_flag.svg/1024px-Transgender_Pride_flag.svg.png',
    pansexual: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Pansexual_Pride_flag.svg/1024px-Pansexual_Pride_flag.svg.png',
    asexual: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Asexual_flag.svg/1024px-Asexual_flag.svg.png'
};

async function fetchBuffer(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
}

let handler = async (m, { conn, text }) => {
    let key = text?.toLowerCase();
    if (!key || !flags[key]) return conn.reply(m.chat, '⚠️ Opción inválida. Usa: gay, bisexual, trans, pansexual, asexual.', m);

    try {
        const buffer = await fetchBuffer(flags[key]);
        await conn.sendMessage(m.chat, { image: buffer, caption: `🏳️‍🌈 Aquí está la bandera ${key}!` }, { quoted: m });
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, '[ALERTA] Ocurrió un error procesando la imagen.', m);
    }
};

handler.command = ['lgtb', 'bandera'];
handler.help = ['lgtb <opción>'];
handler.tags = ['fun'];

export default handler;
