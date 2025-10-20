// plugins/_lgtbgay.js
import fs from 'fs';
import axios from 'axios';
import path from 'path';

let handler = async (m, { conn, text }) => {
    try {
        // Lista de URLs de banderas LGBT+ actualizadas
        const flags = [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Gay_pride_flag_2016.svg/1024px-Gay_pride_flag_2016.svg.png',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Transgender_Pride_flag.svg/1024px-Transgender_Pride_flag.svg.png',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Bisexual_Pride_flag.svg/1024px-Bisexual_Pride_flag.svg.png',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Pansexual_Pride_flag.svg/1024px-Pansexual_Pride_flag.svg.png',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Asexual_Pride_flag.svg/1024px-Asexual_Pride_flag.svg.png',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Nonbinary_Pride_flag.svg/1024px-Nonbinary_Pride_flag.svg.png'
        ];

        // Elegir una URL aleatoria
        const url = flags[Math.floor(Math.random() * flags.length)];

        // Descargar la imagen
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // Enviar la imagen
        await conn.sendMessage(m.chat, { image: buffer, caption: '🏳️‍🌈 ¡Aquí está tu bandera!' }, { quoted: m });

    } catch (err) {
        console.error(err);
        await conn.reply(m.chat, '[ALERTA] Ocurrió un error procesando la imagen.', m);
    }
};

handler.help = ['lgtb @usuario'];
handler.tags = ['fun'];
handler.command = /^lgtb$/i;

export default handler;
