// plugins/colección-media.js
import fs from 'fs';
import path from 'path';

const mediaFolder = './media';
if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);

export async function all(m, { conn }) {
  try {
    // Detectar tipo de mensaje
    const msgType = Object.keys(m.message || {}).find(k => k.endsWith('Message'));
    if (!msgType) return;

    // Descargar media
    const media = await conn.downloadMediaMessage(m, 'buffer', {}, { 
      logger: console, 
      reuploadRequest: conn.waUploadToServer 
    });

    // Detectar extensión
    let extension = 'dat';
    if (msgType.includes('image')) extension = 'jpg';
    if (msgType.includes('video')) extension = 'mp4';
    if (msgType.includes('document')) extension = m.message.documentMessage?.fileName.split('.').pop() || 'dat';
    if (msgType.includes('audio')) extension = 'mp3';

    // Guardar archivo en media/
    const filename = `media_${Date.now()}.${extension}`;
    const filepath = path.join(mediaFolder, filename);
    fs.writeFileSync(filepath, media);

    // Inicializar la sección media en la base de datos
    if (!global.db.data.media) global.db.data.media = {};
    if (!global.db.data.media[m.sender]) global.db.data.media[m.sender] = {};

    // Guardar la última media por tipo
    global.db.data.media[m.sender][msgType.replace('Message','')] = {
      filename,
      date: new Date()
    };

    // Guardar automáticamente en media.json
    fs.writeFileSync('./media.json', JSON.stringify(global.db.data.media, null, 2));

    console.log('✅ Media guardada para', m.sender, ':', filename);

  } catch (e) {
    console.error('❌ Error guardando media:', e);
  }
}
