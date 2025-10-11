import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};
    if (m.isGroup && !chat.nsfw) return m.reply('❌ NSFW desactivado.');

    try {
        const urlAPI = 'https://api.waifu.pics/nsfw/pussy'; // ejemplo, cambiar según comando
        const api = await fetch(urlAPI);
        const res = await api.json();

        if (!res.url) throw new Error('No se encontró URL válida.');

        // Descargar archivo
        const response = await fetch(res.url);
        const buffer = Buffer.from(await response.arrayBuffer());
        const fileName = path.join('/data/data/com.termux/files/home/Gaara-Ultra-MD/tmp', 'img.png');

        // Guardar temporal
        fs.writeFileSync(fileName, buffer);

        // Enviar usando Baileys
        await conn.sendMessage(m.chat, {
            image: fs.readFileSync(fileName),
            caption: '🔥 Aquí tu NSFW 🍆'
        }, { quoted: m });

        // Reacción
        await conn.sendMessage(m.chat, { react: { text: '🍆', key: m.key } });

        // Borrar archivo temporal
        fs.unlinkSync(fileName);

    } catch (err) {
        console.error(err);
        m.reply('❌ Error al obtener contenido NSFW.');
    }
};

handler.command = /^pene$/i;
export default handler;
