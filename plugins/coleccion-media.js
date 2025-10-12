// plugins/coleccion-media.js
import fs from 'fs';
import path from 'path';

const mediaFolder = './media';
if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);

export async function all(m, { conn }) {
    try {
        // Validar que haya mensaje con media
        const msgType = Object.keys(m.message || {}).find(k => k.endsWith('Message'));
        if (!msgType) return;

        // Solo guardar ciertos tipos
        const allowedTypes = ['image', 'video', 'document', 'audio'];
        if (!allowedTypes.some(t => msgType.toLowerCase().includes(t))) return;

        // Descargar media
        const media = await conn.downloadMediaMessage(m, 'buffer', {}, {
            logger: console,
            reuploadRequest: conn.waUploadToServer
        });

        // Definir extensión según tipo
        let extension = 'dat';
        if (msgType.includes('image')) extension = 'jpg';
        if (msgType.includes('video')) extension = 'mp4';
        if (msgType.includes('document')) extension = m.message.documentMessage?.fileName?.split('.').pop() || 'dat';
        if (msgType.includes('audio')) extension = 'mp3';

        const filename = `media_${Date.now()}.${extension}`;
        const filepath = path.join(mediaFolder, filename);

        fs.writeFileSync(filepath, media);

        // Inicializar sección media si no existe
        if (!global.db.data.media) global.db.data.media = {};
        if (!global.db.data.media[m.sender]) global.db.data.media[m.sender] = {};

        // Guardar último media por usuario
        global.db.data.media[m.sender][msgType.replace('Message','')] = {
            filename,
            date: new Date(),
            chat: m.chat,
            fromGroup: m.isGroup || false
        };

        // Guardar media.json automáticamente
        fs.writeFileSync('./media.json', JSON.stringify(global.db.data.media, null, 2));

        console.log(`✅ Media guardada: ${filename} | Usuario: ${m.sender} | Grupo: ${m.isGroup}`);

    } catch (e) {
        console.error('❌ Error guardando media:', e);
    }
}
