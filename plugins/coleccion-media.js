// plugins/collect-media.js
import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const mediaFolder = './media';
const mediaJson = './media.json';
if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);

function saveMediaJson(data) {
  try { fs.writeFileSync(mediaJson, JSON.stringify(data, null, 2)) }
  catch (e) { console.error('Error escribiendo media.json', e) }
}

export async function all(m, { conn }) {
  try {
    // solo en grupos
    if (!m.isGroup) return;

    const msgType = Object.keys(m.message || {}).find(k => k.endsWith('Message'));
    if (!msgType) return;

    // tipos manejados
    const allowed = ['imageMessage','videoMessage','documentMessage','audioMessage'];
    if (!allowed.includes(msgType)) return;

    // descargar stream y armar buffer
    const stream = await downloadContentFromMessage(m.message[msgType], msgType.replace('Message',''));
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    // extension por tipo
    let ext = 'dat';
    if (msgType.includes('image')) ext = 'jpg';
    if (msgType.includes('video')) ext = 'mp4';
    if (msgType.includes('audio')) ext = 'mp3';
    if (msgType.includes('document')) ext = m.message.documentMessage?.fileName?.split('.').pop() || 'dat';

    const filename = `media_${Date.now()}.${ext}`;
    const filepath = path.join(mediaFolder, filename);
    fs.writeFileSync(filepath, buffer);

    // crear estructura si no existe
    if (!global.db) global.db = { data: {} }
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.media) global.db.data.media = {}
    if (!global.db.data.mediaList) global.db.data.mediaList = []

    // entrada resumen por usuario (compatible con tu formato anterior)
    if (!global.db.data.media[m.sender]) global.db.data.media[m.sender] = {}
    global.db.data.media[m.sender][msgType.replace('Message','')] = {
      filename,
      date: (new Date()).toISOString(),
      chat: m.chat,
      fromGroup: true
    }

    // lista global (cada item con id para pedirlo luego)
    const id = global.db.data.mediaList.length // id incremental (0,1,2...)
    const entry = {
      id,
      filename,
      path: filepath,
      from: m.sender,
      groupId: m.chat,
      // intentar nombre del grupo si está en metadata
      groupName: (m.isGroup && conn.chats[m.chat]?.name) || null,
      type: msgType.replace('Message',''),
      date: (new Date()).toISOString()
    }
    global.db.data.mediaList.push(entry)

    // persistir media.json (solo la parte de media para compatibilidad)
    try {
      saveMediaJson(global.db.data.media)
    } catch(e){ console.error(e) }

    // opcional: persistir db completa si quieres (a tu criterio)
    try {
      fs.writeFileSync('./database.json', JSON.stringify(global.db.data, null, 2))
    } catch (e) {}

    console.log(`✅ Media guardada: ${filename} | id: ${id} | from: ${m.sender} | group: ${entry.groupName || entry.groupId}`);
  } catch (e) {
    console.error('❌ Error guardando media:', e);
  }
}
