// plugins/_lgtbgay.js
// Requiere: jimp, axios
// Instalar: npm i jimp axios

import Jimp from 'jimp';
import axios from 'axios';

const handler = async (m, { conn, command }) => {
  try {
    // Detectar usuario a procesar (mencionado o propio)
    let userId;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      userId = m.mentionedJid[0];
    } else {
      userId = m.sender;
    }

    // Obtener foto de perfil
    let ppUrl;
    try { ppUrl = await conn.profilePictureUrl(userId); } catch (e) { ppUrl = null; }
    if (!ppUrl) return await conn.sendMessage(m.chat, { text: 'El usuario no tiene foto de perfil pública.' }, { quoted: m });

    // URLs de banderas
    const flags = {
      lgtb: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Gay_pride_flag_2016.png',
      gay:  'https://upload.wikimedia.org/wikipedia/commons/9/9f/Progress_Pride_flag.png'
    };
    const flagUrl = command.toLowerCase().includes('lgtb') ? flags.lgtb : flags.gay;

    // Descargar imágenes
    const fetchBuffer = async (url) => {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(res.data, 'binary');
    };
    const [ppBuf, flagBuf] = await Promise.all([fetchBuffer(ppUrl), fetchBuffer(flagUrl)]);

    // Procesar con Jimp
    const [ppImg, flagImg] = await Promise.all([Jimp.read(ppBuf), Jimp.read(flagBuf)]);

    const size = 512;
    ppImg.cover(size, size);
    flagImg.resize(size, size);

    // Hacer avatar circular
    const mask = await new Jimp(size, size, 0x00000000);
    mask.scan(0, 0, size, size, (x, y, idx) => {
      const rx = x - size/2;
      const ry = y - size/2;
      if (Math.sqrt(rx*rx + ry*ry) <= size/2) mask.bitmap.data[idx+3] = 255;
    });
    ppImg.mask(mask, 0, 0);

    // Poner bandera encima con transparencia
    ppImg.composite(flagImg, 0, 0, {
      mode: Jimp.BLEND_OVERLAY,
      opacitySource: 0.55,
      opacityDest: 1
    });

    const finalBuf = await ppImg.getBufferAsync(Jimp.MIME_PNG);

    // Enviar resultado mencionando
    await conn.sendMessage(m.chat, {
      image: finalBuf,
      caption: `🌈 Foto de perfil con bandera (${command})`,
      mentions: [userId]
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: 'Ocurrió un error procesando la imagen.' }, { quoted: m });
  }
};

handler.help = ['lgtb', 'gay'];
handler.tags = ['fun', 'image'];
handler.command = /^(lgtb|gay)$/i;

export default handler;
