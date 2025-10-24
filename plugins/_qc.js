// plugins/_qc.js
import { writeFileSync } from 'fs';
import { Sticker } from 'wa-sticker-formatter';

let handler = async (m, { conn, text }) => {
  try {
    let mediaMsg = m.quoted || m; // Tomar mensaje citado o el mismo
    let buffer;

    // Si tiene imagen o video, usarlo
    if (mediaMsg.image || mediaMsg.video) {
      buffer = await mediaMsg.download?.(); 
    } else {
      // Si es texto, crear imagen con el texto
      const Canvas = require('canvas');
      const canvas = Canvas.createCanvas(512, 512);
      const ctx = canvas.getContext('2d');

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);

      // Texto negro
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 30px Sans';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text || mediaMsg.text || 'Sticker', 256, 256);

      buffer = canvas.toBuffer();
    }

    // Crear sticker
    let sticker = new Sticker(buffer, {
      pack: 'GaaraBot',
      author: 'FélixCat',
      type: 'full'
    });

    const stickerBuffer = await sticker.toBuffer();
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ No se pudo crear el sticker.');
  }
};

handler.command = ['qc'];
handler.tags = ['sticker'];
handler.help = ['.qc'];
export default handler;
