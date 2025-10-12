import fs from 'fs';
import path from 'path';

const mediaFolder = './media';
if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);

let handler = async (m, { conn }) => {
  try {
    const msgType = Object.keys(m.message || {}).find(k => k.endsWith('Message'));
    if (!msgType) return;

    const media = await conn.downloadMediaMessage(m, 'buffer', {}, { 
      logger: console, 
      reuploadRequest: conn.waUploadToServer 
    });

    let extension = 'dat';
    if (msgType.includes('image')) extension = 'jpg';
    if (msgType.includes('video')) extension = 'mp4';
    if (msgType.includes('document')) extension = m.message.documentMessage?.fileName.split('.').pop() || 'dat';
    if (msgType.includes('audio')) extension = 'mp3';

    const filename = `media_${Date.now()}.${extension}`;
    const filepath = path.join(mediaFolder, filename);
    fs.writeFileSync(filepath, media);

    // Guardar en la base de datos existente
    if (!global.db.data.media) global.db.data.media = [];

    global.db.data.media.push({
      id: m.key.id,
      from: m.key.remoteJid,
      tipo: msgType.replace('Message',''),
      filename,
      fecha: new Date(),
      ephemeral: m.message?.protocolMessage?.type === 0 ? true : false
    });

    // Guardar cambios en el db.json
    fs.writeFileSync('./db.json', JSON.stringify(global.db.data, null, 2));

    console.log('✅ Media guardada en la base de datos:', filename);

  } catch (e) {
    console.error('❌ Error guardando media:', e);
  }
};

export default handler;
