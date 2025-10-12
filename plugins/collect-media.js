import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const mediaFolder = './media';
if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);

export async function all(m, { conn }) {
    try {
        const msgType = Object.keys(m.message || {}).find(k => k.endsWith('Message'));
        if (!msgType) return;

        // Solo ciertos tipos de media
        if (!['imageMessage','videoMessage','documentMessage','audioMessage'].includes(msgType)) return;

        // Descargar contenido
        const stream = await downloadContentFromMessage(m.message[msgType], msgType.replace('Message',''));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Determinar extensión
        let extension = 'dat';
        if (msgType.includes('image')) extension = 'jpg';
        if (msgType.includes('video')) extension = 'mp4';
        if (msgType.includes('audio')) extension = 'mp3';
        if (msgType.includes('document')) extension = m.message.documentMessage?.fileName.split('.').pop() || 'dat';

        const filename = `media_${Date.now()}.${extension}`;
        const filepath = path.join(mediaFolder, filename);
        fs.writeFileSync(filepath, buffer);

        if (!global.db.data.media) global.db.data.media = {};
        if (!global.db.data.media[m.sender]) global.db.data.media[m.sender] = {};

        global.db.data.media[m.sender][msgType.replace('Message','')] = {
            filename,
            date: new Date()
        };

        fs.writeFileSync('./media.json', JSON.stringify(global.db.data.media, null, 2));

        console.log(`✅ Media guardada para ${m.sender}: ${filename}`);
    } catch (e) {
        console.error('❌ Error guardando media:', e);
    }
}
