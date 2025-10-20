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
    '.ruletaban':'🎯'
  },
  'game': {
    '.acertijo':'❓', '.math':'➗', '.dance *<@user>*':'💃',
    '.ppt':'✂️', '.adivinanza':'❓', '.bandera':'🏴', '.capital':'🏛️', '.trivia':'🎯','.miau':'🐈‍⬛' 
  },
  'group': {'.enable <opción>':'✅', '.disable <opción>':'❌'},
  'downloader': {
    '.play <nombre de la canción>':'🎵',
    '.apk2 <nombre de la app>':'📲',
    '.facebook <url>':'📘',
    '.ig <usuario>':'📸',
    '.play2 <nombre>':'🎶',
    '.ytmp3 <url>':'🎵',
    '.ytmp4 <url>':'🎬',
    '.mediafire <url>':'📥',
    '.spotify <url>':'🎧',
    '.tiktok <url>':'🎵',
    '.tiktoksearch <texto>':'🔎'
  },
  'sticker': {'.stiker <img>':'🖼️', '.sticker <url>':'🖼️'},
  'tools': {'.invite':'📩', '.superinspect':'🔎', '.inspect':'🔍', '.reportar <mensaje>':'🚨'},
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
╭━━━━━━━━━━━━━━━━━━━━╮
│ 😸 *${botname}* 😸
│ ❒ *Creador:* ${creador} 🐾
│ ❒ *Versión:* ${versionBot} 😺
│ ❒ *Saludo:* ${saludo} 🐱
╰━━━━━━━━━━━━━━━━━━━━╯
`;

    for (let tag of Object.keys(tags)) {
      let comandos = comandosPorCategoria[tag];
      if (!comandos) continue;

      menuText += `
╭━━━〔 ${tags[tag]} 〕━━━╮
${Object.entries(comandos).map(([cmd, emoji]) => `│ ${emoji} ${cmd}`).join('\n')}
╰━━━━━━━━━━━━━━━━━━━━╯
`;
    }

    menuText += `\n✨ Powered by FelixCat 🥷🏽`;

    // Si es chat privado, agregamos aviso
    if (!m.isGroup) menuText += `\n\n🐾 Este menú se muestra por privado.`;

    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `✖️ Error mostrando el menú\n\n${e}` }, { quoted: m });
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu','allmenu','menú'];

// Para que funcione para todos
handler.owner = false;
handler.admin = false;
handler.group = false;
handler.private = false;

export default handler;

function getSaludoGatuno() {
  let hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅 Maullidos buenos días!";
  if (hour >= 12 && hour < 18) return "☀️ Maullidos buenas tardes!";
  return "🌙 Maullidos buenas noches!";
}
