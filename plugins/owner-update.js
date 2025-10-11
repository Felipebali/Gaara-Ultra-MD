import { exec } from 'child_process';

let handler = async (m, { conn }) => {
  const emoji4 = '🐈‍⬛';
  const msm = '⚠️';

  m.reply(`🐾 *Felix-Cat está preparando su maullido de actualización...*\n😼 Maullando suavemente...`);

  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      conn.reply(m.chat, `${msm} Oh no~ Felix-Cat no pudo actualizar.\n💥 Razón: ${err.message}`, m);
      return;
    }

    if (stderr) {
      console.warn('⚠️ Advertencia durante la actualización:', stderr);
    }

    if (stdout.includes('Already up to date.')) {
      conn.reply(m.chat, `${emoji4} Felix-Cat revisó todo: ¡ya estás al día, humano! 🐾`, m);
    } else {
      conn.reply(
        m.chat,
        `🌿 *Felix-Cat completó la actualización con éxito!* 😸\n\n*Detalles de la operación:*\n${stdout}\n\n🎩 ¡Maullido de victoria!`,
        m
      );
    }
  });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar'];

export default handler;
