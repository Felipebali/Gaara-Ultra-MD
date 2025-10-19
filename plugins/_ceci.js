// plugins/ceci.js
const ownerNumbers = ['59896026646', '59898719147', '5492975808859']; // Dueños + número autorizado

// Lista de frases románticas
const frases = [
    "Ezequiel Subiabre es el amor de tu vida ❤️",
    "El corazón de @ es de Ezequiel Subiabre 💖",
    "No hay nadie como Ezequiel Subiabre en tu vida 😍",
    "Cada día más enamorada de Ezequiel Subiabre 💘",
    "Ezequiel Subiabre te hace sonreír incluso sin estar cerca 😊",
    "El amor verdadero se llama Ezequiel Subiabre 💝",
    "Nunca olvides que Ezequiel Subiabre te adora ❤️‍🔥"
];

let handler = async (m, { conn }) => {
    const sender = m.sender.replace(/[^0-9]/g, '');
    if (!ownerNumbers.includes(sender)) {
        return conn.sendMessage(m.chat, { text: '❌ Solo los dueños o el número autorizado pueden usar este comando.' }, { quoted: m });
    }

    const senderTag = '@' + m.sender.split('@')[0];
    const frase = frases[Math.floor(Math.random() * frases.length)].replace('@', senderTag);

    await conn.sendMessage(m.chat, { text: frase }, { quoted: m });
};

handler.help = ['ceci'];
handler.tags = ['fun'];
handler.command = ['ceci'];
handler.register = true;

export default handler;
