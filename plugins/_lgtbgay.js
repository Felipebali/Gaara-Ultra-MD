// plugins/_lgtbgay.js
// Requiere: jimp, axios
// Instalar dependencias: npm i jimp axios

const Jimp = require('jimp');
const axios = require('axios');

const handler = async (m, { conn, command }) => {
  try {
    const userId = m.sender || (m.quoted && m.quoted.sender);
    if (!userId) return conn.sendMessage(m.chat, { text: 'No pude obtener el usuario.' }, { quoted: m });

    // Obtener foto de perfil
    let ppUrl;
    try { ppUrl = await conn.profilePictureUrl(userId); } catch (e) { ppUrl = null; }
    if (!ppUrl) return conn.sendMessage(m.chat, { text: 'El usuario no tiene foto de perfil pública.' }, { quoted: m });

    // URLs válidas de banderas
    const flags = {
      lgtb: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Gay_pride_flag_2016.png',
      gay:  'https://upload.wikimedia.org/wikipedia/commons/9/9f/Progress_Pride_flag.png'
    };
    const flagUrl = command.toLowerCase().includes('lgtb') ? flags.lgtb : flags.gay;

    // Descargar buffers
    const fetchBuffer = async (url) => {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(res.data, 'binary');
    };

    const [ppBuf, flagBuf] = await Promise.all([fetchBuffer(ppUrl), fetchBuffer(flagUrl)]);

    // Procesar imágenes con Jimp
    const [ppImg, flagImg] = await Promise.all([Jimp.read(ppBuf), Jimp.read(flagBuf)]);

    // Ajustar tamaño
    const size = 512;
    ppImg.cover(size, size); 
    flagImg.resize(size, size);

    // Aplicar bandera encima con transparencia
    const output = ppImg.clone();
    output.composite(flagImg, 0, 0, {
      mode: Jimp.BLEND_OVERLAY,
      opacitySource: 0.55,
      opacityDest: 1
    });

    const finalBuf = await output.getBufferAsync(Jimp.MIME_PNG);

    // Enviar imagen
    await conn.sendMessage(m.chat, { image: finalBuf, caption: `Foto de perfil con bandera (${command})` }, { quoted: m });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: 'Ocurrió un error procesando la imagen.' }, { quoted: m });
  }
};

handler.help = ['lgtb', 'gay'];
handler.tags = ['fun', 'image'];
handler.command = /^(lgtb|gay)$/i;

module.exports = handler;
