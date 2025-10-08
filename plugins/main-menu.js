// plugins/menu.js
const botname = global.botname || '😸 FelixCat-Bot 😸';
const creador = 'Felipe';
const versionBot = '10.5.0';

let tags = {
  'serbot': '🤖 SUB-BOTS 🐾',
  'info': '🌀 INFOS 🐱',
  'main': '📜 MENÚ FELINO 🐾',
  'nable': '⚡ MODO AVANZADO 🐾',
  'game': '🎮 JUEGOS GATUNOS 🐱',
  'group': '📚 GRUPOS 🐾',
  'downloader': '📥 DESCARGAS 😺',
  'sticker': '🖼️ STICKERS 🐾',
  'tools': '🧰 HERRAMIENTAS 😼',
  'gacha': '🧧 ANIME 🐱',
  'nsfw': '🔞 NSFW 🐾',
  'especiales': '📂 MENÚS ESPECIALES 🐾'
};

let comandosPorCategoria = {
  'serbot': {'.qr':'🔗', '.code':'💻'},
  'info': {'.creador':'👑', '.dash':'📊', '.status':'📈', '.estado':'📉', '.ping':'📶', '.infobot':'🤖', '.lid':'🆔'},
  'main': {'.menu':'📜'},
  'nable': {
    '.welcome':'👋', '.bv':'🎉', '.bienvenida':'🎊', '.antiprivado':'🚫', '.restrict':'🔒',
    '.autolevelup':'⬆️', '.autonivel':'⬆️', '.antibot':'🤖', '.autoaceptar':'✅', '.autorechazar':'❌',
    '.autoresponder':'💬', '.antisubbots':'🚫', '.modoadmin':'🛡️', '.soloadmin':'🛡️', '.autoread':'👀',
    '.autover':'📝', '.antiver':'📝', '.antiviewonce':'👁️', '.reaction':'❤️', '.emojis':'😺',
    '.nsfw':'🔞', '.antispam':'🚫', '.antidelete':'❌', '.delete':'🗑️', '.jadibotmd':'🤖', '.detect':'🕵️‍♂️',
    '.configuraciones':'⚙️', '.avisodegp':'📢', '.simi':'💬', '.antilink':'🔗', '.antitoxic':'☣️',
    '.antitraba':'🚫', '.antifake':'❌', '.antivirtuales':'👻',
    '.ruletaban':'🎯' // <-- agregado aquí
  },
  'game': {
    '.acertijo':'❓', '.math':'➗', '.ahorcado':'🔤', '.dance *<@user>*':'💃',
    '.delttt':'❌', '.ppt':'✂️', '.adivinanza':'❓', '.bandera':'🏴', '.ttt':'❌', '.capital':'🏛️', '.trivia':'🎯','.miau':'🐈‍⬛' 
  },
  'group': {'.enable <opción>':'✅', '.disable <opción>':'❌'},
  'downloader': {'.play <nombre de la canción>':'🎵'},
  'sticker': {'.stiker <img>':'🖼️', '.sticker <url>':'🖼️'},
  'tools': {'.invite':'📩', '.superinspect':'🔎', '.inspect':'🔍'},
  'gacha': {
    '.toanime':'🎨', '.toghibli':'🏞️', '.robawaifu <id>':'💖', '.desbloquear @usuario':'🔓', '.claim':'📥',
    '.harem [@usuario] [pagina]':'👑', '.miswaifus':'🧧', '.resetwaifus':'♻️', '.ver':'👀', '.rw':'🔄',
    '.rollwaifu':'🎲', '.topwaifus [página]':'🏆', '.wvideo <nombre>':'🎬', '.wimage <nombre>':'🖼️',
    '.charinfo <nombre>':'📖', '.winfo <nombre>':'ℹ️', '.waifuinfo <nombre>':'ℹ️'
  },
  'nsfw': {
    '.sixnine/69 @tag':'🍆', '.anal/culiar @tag':'🍑', '.blowjob/mamada @tag':'💦', '.follar @tag':'🔥',
    '.grabboobs/agarrartetas @tag':'👙', '.searchhentai':'🔞', '.hentaisearch':'🔎', '.penetrar @user':'🍑',
    '.sexo/sex @tag':'🔥', '.tetas':'👙'
  },
  'especiales': {
    '.menuj':'🎮', '.menuhot':'🔥', '.menugp':'📚', '.menuow':'👑', '.menudl':'📥'
  }
};

let handler = async (m, { conn }) => {
  try {
    let saludo = getSaludoGatuno();
    let menuText = `
╭━━━〔 😸 *MENÚ FELIXCAT-BOT* 😸 〕━━━⬣
┃ ❒ *Creador*: ${creador} 🐾
┃ ❒ *Versión*: ${versionBot} 😺
┃ ❒ *Saludo*: ${saludo} 🐱
╰━━━━━━━━━━━━━━━━━━━━⬣
`;

    for (let tag of ['serbot','info','main','nable','game','group','downloader','sticker','tools','gacha','nsfw','especiales']) {
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

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu','allmenu','menú'];

export default handler;

function getSaludoGatuno() {
  let hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅 Maullidos buenos días!";
  if (hour >= 12 && hour < 18) return "☀️ Maullidos buenas tardes!";
  return "🌙 Maullidos buenas noches!";
}
