// plugins/_banderas_pp.js
// Requiere: jimp, axios
// Instalar: npm i jimp axios

import Jimp from 'jimp';
import axios from 'axios';

let handler = async (m, { conn, command }) => {
  try {
    const userId = m.sender || (m.quoted && m.quoted.sender);
    if (!userId) return await conn.sendMessage(m.chat, { text: 'No pude obtener el usuario.' }, { quoted: m });

    // Intentos para obtener la URL de la foto de perfil según diferentes libs
    let ppUrl = null;
    try { ppUrl = await conn.profilePictureUrl(userId); } catch (e) {}
    try { if (!ppUrl && conn.getProfilePicture) ppUrl = await conn.getProfilePicture(userId); } catch (e) {}
    try { if (!ppUrl && conn.getProfilePictureUrl) ppUrl = await conn.getProfilePictureUrl(userId); } catch (e) {}
    // Si no hay foto, usar avatar por defecto (opcional)
    if (!ppUrl) {
      // imagen por defecto pública (si la red lo permite) o devolvemos error
      return await conn.sendMessage(m.chat, { text: 'El usuario no tiene foto de perfil pública.' }, { quoted: m });
    }

    // URLs de banderas (PNG, directas)
    const flags = {
      lgtb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Gay_pride_flag_2016.svg/1280px-Gay_pride_flag_2016.svg.png',
      gay:  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Progress_Pride_flag.svg/1280px-Progress_Pride_flag.svg.png'
    };

    const flagUrl = command.toLowerCase().includes('lgtb') ? flags.lgtb : flags.gay;

    // Descarga buffers
    const fetchBuffer = async (url) => {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(res.data, 'binary');
    };

    const [ppBuf, flagBuf] = await Promise.all([fetchBuffer(ppUrl), fetchBuffer(flagUrl)]);

    // Procesamiento con Jimp
    const [ppImg, flagImg] = await Promise.all([Jimp.read(ppBuf), Jimp.read(flagBuf)]);

    // Hacer cuadrada la foto de perfil (cortar/resize) y centrar
    const size = 512; // tamaño final
    ppImg.cover(size, size); // magnifica y recorta para cubrir el tamaño
    // Opcional: hacer avatar circular - si quieres, descomenta esta sección:
    /*
    const mask = await new Jimp(size, size, 0x00000000);
    mask.scan(0,0,size,size, function(x,y,idx){
      const rx = x - size/2;
      const ry = y - size/2;
      const r = Math.sqrt(rx*rx + ry*ry);
      if (r <= size/2) {
        mask.bitmap.data[idx+0] = 255;
        mask.bitmap.data[idx+1] = 255;
        mask.bitmap.data[idx+2] = 255;
        mask.bitmap.data[idx+3] = 255;
      } else {
        mask.bitmap.data[idx+3] = 0;
      }
    });
    ppImg.mask(mask, 0, 0);
    */

    // Ajustar la bandera al tamaño y aplicar opacidad
    flagImg.resize(size, size);

    // Creamos una copia del PP y compositeamos la bandera encima con opacidad
    const output = ppImg.clone();
    // Puedes ajustar opacitySource (0.0 - 1.0) para más/menos transparencia
    const opacity = 0.55;

    // Componer: primero la foto, luego la bandera encima con la opacidad elegida
    output.composite(flagImg, 0, 0, {
      mode: Jimp.BLEND_OVERLAY,
      opacitySource: opacity,
      opacityDest: 1
    });

    // Exportar buffer jpeg/png
    const finalBuf = await output.getBufferAsync(Jimp.MIME_PNG);

    // Enviar la imagen resultante
    await conn.sendMessage(m.chat, { image: finalBuf, caption: `Foto de perfil con bandera (${command})` }, { quoted: m });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: 'Ocurrió un error procesando la imagen.' }, { quoted: m });
  }
};

handler.help = ['lgtb', 'gay'];
handler.tags = ['fun', 'image'];
handler.command = /^(lgtb|gay)$/i;

export default handler;
