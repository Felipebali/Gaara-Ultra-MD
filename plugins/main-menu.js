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
  'nable': { '.welcome':'👋', '.bv':'🎉', '.bienvenida':'🎊', '.antiprivado':'🚫', '.restrict':'🔒', '.autolevelup':'⬆️', '.autonivel':'⬆️', '.antibot':'🤖', '.autoaceptar':'✅', '.autorechazar':'❌', '.autoresponder':'💬', '.antisubbots':'🚫', '.modoadmin':'🛡️', '.soloadmin':'🛡️', '.autoread':'👀', '.autover':'📝', '.antiver':'📝', '.antiviewonce':'👁️', '.reaction':'❤️', '.emojis':'😺', '.nsfw':'🔞', '.antispam':'🚫', '.antidelete':'❌', '.delete':'🗑️', '.jadibotmd':'🤖', '.detect':'🕵️‍♂️', '.configuraciones':'⚙️', '.avisodegp':'📢', '.simi':'💬', '.antilink':'🔗', '.antitoxic':'☣️', '.antitraba':'🚫', '.antifake':'❌', '.antivirtuales':'👻', '.ruletaban':'🎯' },
  'game': { '.acertijo':'❓', '.math':'➗', '.dance *<@user>*':'💃', '.ppt':'✂️', '.adivinanza':'❓', '.bandera':'🏴', '.capital':'🏛️', '.trivia':'🎯','.miau':'🐈‍⬛' },
  'group': {'.enable <opción>':'✅', '.disable <opción>':'❌'},
  'downloader': { '.play <nombre de la canción>':'🎵', '.apk2 ':'📲', '.facebook ':'📘', '.ig ':'📸', '.play2 ':'🎶', '.ytmp3 ':'🎵', '.ytmp4 ':'🎬', '.mediafire ':'📥', '.spotify ':'🎧', '.tiktok ':'🎵', '.tiktoksearch ':'🔎' },
  'sticker': {'.stiker ':'🖼️', '.sticker ':'🖼️'},
  'tools': {'.invite':'📩', '.superinspect':'🔎', '.inspect':'🔍', '.reportar ':'🚨'},
  'nsfw': { '.sixnine/69 @tag':'🍆', '.anal/culiar @tag':'🍑', '.blowjob/mamada @tag':'💦', '.follar @tag':'🔥', '.grabboobs/agarrartetas @tag':'👙', '.searchhentai':'🔞', '.hentaisearch':'🔎', '.penetrar @user':'🍑', '.sexo/sex @tag':'🔥', '.tetas':'👙' },
  'especiales': { '.menuj':'🎮', '.menuhot':'🔥', '.menugp':'📚', '.menuow':'👑', '.menudl':'📥' } 
};

let handler = async (m, { conn }) => { 
  try { 
    let saludo = getSaludoGatuno();
    let menuText = `╭━━━━━━━━━━━━━━━━━━━━╮
│ 😸 *${botname}* 😸
│ ❒ *Creador:* ${creador} 🐾
│ ❒ *Versión:* ${versionBot} 😺
│ ❒ *Saludo:* ${saludo} 🐱
╰━━━━━━━━━━━━━━━━━━━━╯\n`;

    for (let tag of Object.keys(tags)) {     
      let comandos = comandosPorCategoria[tag];     
      if (!comandos) continue;      
      menuText += `\n╭━━━〔 ${tags[tag]} 〕━━━╮
${Object.entries(comandos).map(([cmd, emoji]) => `│ ${emoji} ${cmd}`).join('\n')}
╰━━━━━━━━━━━━━━━━━━━━╯\n`;
    }

    menuText += `\n✨ Powered by FelixCat 🥷🏽`;

    // Envío solo texto (sin imagen)
    await conn.reply(m.chat, menuText, m);

  } catch (e) { 
    console.error(e); 
    await conn.reply(m.chat, `✖️ Error mostrando el menú\n\n${e}`, m); 
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
