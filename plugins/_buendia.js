// plugins/buendia.js
let lastIndexBuendia = -1;

let handler = async (m, { conn, participants }) => {
    const owners = global.owner.map(o => o[0]);
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

    if (m.text && m.text.toLowerCase() === 'buendia') {
        const mensajes = [
            '🌅 Buenos días a todos, que su café esté fuerte y su ánimo más fuerte 😼☕',
            '¡Buenos días! Que el grupo tenga un día épico 😎',
            '☀️ Despierten y brillen, hoy será un gran día 😼',
            'Buenos días, que hoy solo entren cosas buenas al grupo 😏',
            '¡Arriba! Que la mañana esté llena de risas y buena onda 😼',
            '🌄 Buen día a todos, prepárense para conquistar el mundo 😎'
        ];

        let index;
        do { index = Math.floor(Math.random() * mensajes.length); } while (index === lastIndexBuendia);
        lastIndexBuendia = index;

        const mensaje = mensajes[index];
        const mentions = participants.map(p => p.jid);

        await conn.sendMessage(m.chat, { text: mensaje, mentions });
    }
};

handler.customPrefix = /^buendia$/i;
handler.command = new RegExp();
handler.owner = true;
export default handler;
