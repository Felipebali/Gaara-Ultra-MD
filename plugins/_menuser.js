// plugins/menuUsuario.js
const botname = global.botname || '😸 FelixCat-Bot 😸';
const creador = 'Felipe';
const versionBot = '10.5.0';

let tags = {
  'info': '🌀 INFOS 🐱',
  'main': '📜 MENÚ FELINO 🐾',
  'game': '🎮 JUEGOS GATUNOS 🐱',
  'downloader': '📥 DESCARGAS 😺',
  'sticker': '🖼️ STICKERS 🐾',
  'tools': '🧰 HERRAMIENTAS 😼',
  'especiales': '📂 MENÚS ESPECIALES 🐾'
};

let comandosPorCategoria = {
  'info': {'.creador':'👑', '.dash':'📊', '.status':'📈', '.ping':'📶', '.infobot':'🤖', '.lid':'🆔'},
  'main': {'.menu':'📜'},
  'game': {
    '.acertijo':'❓', '.math':'➗', '.ahorcado':'🔤', '.dance *<@user>*':'💃',
    '.ppt':'✂️', '.adivinanza':'❓', '.bandera':'🏴', '.capital':'🏛️', '.trivia':'🎯','.miau':'🐈‍⬛'
  },
  'downloader': {'.play <nombre de la canción>':'🎵'},
  'sticker': {'.stiker <img>':'🖼️', '.sticker <url>':'🖼️'},
  'tools': {'.invite':'📩', '.inspect':'🔍', '.reportar <mensaje>':'🚨'},
  'especiales': {'.menuhot':'🔥', '.menuj':'🎮', '.menudl':'📥'}
};

let handler = async (m, { conn }) => {
  try {
    let saludo = getSaludoGatuno();
    let menuText = `
╭━━━〔 😸 *MENÚ USUARIO FELIXCAT-BOT* 😸 〕━━━⬣
┃ ❒ *Creador*: ${creador} 🐾
┃ ❒ *Versión*: ${versionBot} 😺
┃ ❒ *Saludo*: ${saludo} 🐱
╰━━━━━━━━━━━━━━━━━━━━⬣
`;

    for (let tag of ['info','main','game','downloader','sticker','tools','especiales']) {
      let comandos = comandosPorCategoria[tag];
      if (!comandos) continue;

      menuText += `
╭━━━〔 ${tags[tag]} 〕━━━⬣
${Object.entries(comandos).map(([cmd, emoji]) => `┃ 🐾 ${cmd} ${emoji}`).join('\n')}
╰━━━━━━━━━━━━━━━━━━━━⬣
`;
    }

    menuText += `\n> 😸 Powered by FelixCat 🥷🏽`;
    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `✖️ Error mostrando el menú\n\n${e}` }, { quoted: m });
  }
};

handler.help = ['menuusuario'];
handler.tags = ['main'];
handler.command = ['menuusuario', 'menuser', 'menuparticipante'];

export default handler;

function getSaludoGatuno() {
  let hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅 Maullidos buenos días!";
  if (hour >= 12 && hour < 18) return "☀️ Maullidos buenas tardes!";
  return "🌙 Maullidos buenas noches!";
}
