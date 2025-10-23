import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
const device = await getDevice(m.key.id);

if (!text) return conn.reply(m.chat, 'Iᴍɢʀᴇsᴀ Eʟ ᴍᴏᴍʙʀᴇ ᴅᴀ ᴍᴜsɪᴄᴀ Qᴜᴇ ǫᴜɪᴇʀᴇs Bᴜsᴄᴀʀ 🎋', m)  

if (device !== 'desktop' && device !== 'web') {  
    const results = await yts(text);  
    const videos = results.videos.slice(0, 20);  
    const randomIndex = Math.floor(Math.random() * videos.length);  
    const randomVideo = videos[randomIndex];  

    const messa = await prepareWAMessageMedia({ image: { url: randomVideo.thumbnail }}, { upload: conn.waUploadToServer });  
    
    // Mensaje de información del video
    await conn.sendMessage(m.chat, {
        image: { url: randomVideo.thumbnail },
        caption: `ＹＯＵＴＵＢＥ － ＰＬＡＹ\n\n» *Título:* ${randomVideo.title}\n» *Duración:* ${randomVideo.duration.timestamp}\n» *Autor:* ${randomVideo.author.name || 'Desconocido'}\n» *Publicado:* ${randomVideo.ago}\n» *Enlace:* ${randomVideo.url}\n\n🎧 Descargando audio...`
    }, { quoted: m });

    try {
        // Descargar el audio
        const stream = ytdl(randomVideo.url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        const filePath = `./tmp/${randomVideo.title.replace(/[^\w\s]/gi, '')}.mp3`;
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);

        writeStream.on('finish', async () => {
            await conn.sendMessage(m.chat, { 
                audio: fs.readFileSync(filePath), 
                mimetype: 'audio/mpeg', 
                fileName: `${randomVideo.title}.mp3`
            }, { quoted: m });
            
            fs.unlinkSync(filePath); // eliminar archivo temporal
        });

        writeStream.on('error', err => {
            console.error(err);
            conn.reply(m.chat, '⚠️ Error al procesar el audio.', m);
        });

    } catch (err) {
        console.error(err);
        conn.reply(m.chat, '🚫 Error al descargar el audio.', m);
    }

} else {  
    const idioma = global.db.data.users[m.sender].language;  
    const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));  
    const traductor = _translate.plugins.buscador_yts;  
    const results = await yts(text);  
    const tes = results.all;  
    const teks = results.all.map((v) => {  
        if (v.type === 'video') return `

° ${v.title}
↳ 🫐 Enlace : ${v.url}
↳ 🕒 Duración : ${v.timestamp}
↳ 📥 Subido : ${v.ago}
↳ 👁 Vistas : ${v.views}`;
}).filter(v => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
conn.sendFile(m.chat, tes[0].thumbnail, 'error.jpg', teks.trim(), m);
}
};

handler.help = ['play <texto>'];
handler.tags = ['dl'];
handler.command = ['play'];
handler.register = true;

export default handler;
