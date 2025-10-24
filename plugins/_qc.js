// plugins/qc.js
import { writeFileSync } from 'fs';
import { sticker } from 'wa-sticker-formatter'; // Si usas wa-sticker-formatter

let handler = async (m, { conn, quoted, command }) => {
  if (!quoted) return m.reply('❌ Debes citar un mensaje que contenga imagen o video.');

  try {
    const media = await quoted.download?.(); // Descarga el contenido citado
    if (!media) return m.reply('❌ No se pudo descargar el contenido.');

    // Crear sticker
    const stickerMessage = await sticker(media, { pack: 'FélixBot', author: 'Feli' });

    await conn.sendMessage(m.chat, { sticker: stickerMessage }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al crear el sticker.');
  }
};

handler.command = ['qc'];
handler.tags = ['sticker'];
handler.group = false;

export default handler; 
