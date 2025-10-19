// plugins/ceci.js
const ownerNumbers = ['59896026646', '59898719147', '5492975808859']; // Dueños + Ceci

const frases = [
    "Ezequiel Subiabre es el amor de tu vida ❤️",
    "El corazón de ${who} es de Ezequiel Subiabre 💖",
    "No hay nadie como Ezequiel Subiabre en tu vida 😍",
    "Cada día más enamorada de Ezequiel Subiabre 💘",
    "Ezequiel Subiabre te hace sonreír incluso sin estar cerca 😊",
    "El amor verdadero se llama Ezequiel Subiabre 💝",
    "Nunca olvides que Ezequiel Subiabre te adora ❤️‍🔥"
];

let handler = async (m, { conn }) => {
    const who = m.sender.replace(/[^0-9]/g, '');
    if (!ownerNumbers.includes(who)) {
        return conn.sendMessage(m.chat, { text: '❌ Solo los dueños o Ceci pueden usar este comando.' });
    }

    // Elegir frase aleatoria y reemplazar @ con el número de quien ejecuta
    let frase = frases[Math.floor(Math.random() * frases.length)];
    frase = frase.replace('${who}', who);

    await conn.sendMessage(m.chat, { text: frase });
};

handler.help = ['ceci'];
handler.tags = ['fun'];
handler.command = ['ceci'];
handler.register = true;

export default handler;
