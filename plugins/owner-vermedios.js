import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('🚫 Solo los dueños del bot pueden usar este comando.');

  const media = global.db.data.media[m.sender];
  if (!media) return m.reply('No tienes medios guardados.');

  let text = '📂 Tus medios guardados:\n\n';
  for (let type in media) {
    text += `• ${type}: ${media[type].filename} (fecha: ${media[type].date})\n`;
  }
  await m.reply(text);

  // Ejemplo: enviar un archivo al chat (último guardado)
  for (let type in media) {
    const filepath = path.join('./media', media[type].filename);
    if (fs.existsSync(filepath)) {
      await conn.sendMessage(m.chat, { document: { url: filepath }, mimetype: 'application/octet-stream' }, { quoted: m });
    }
  }
};

handler.command = ['vermedios', 'mismedios'];
handler.owner = true; // <-- esto restringe solo al owner
export default handler;
