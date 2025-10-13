let lastIndex = { buendia: -1, tardes: -1, noches: -1 };

let handler = async (m, { conn, participants }) => {
    const owners = global.owner.map(o => o[0]);
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

    const comandos = {
        buendia: [
            '🌅 Buenos días a todos, que su café esté fuerte 😼☕',
            '¡Buenos días! Que el grupo tenga un día épico 😎',
            '🌄 Buen día, prepárense para conquistar el mundo 😼'
        ],
        tardes: [
            '🌇 Buenas tardes, respiren profundo 😏',
            '☕ Tarde de mensajes y buen ánimo 😎',
            '🌤️ Tarde tranquila, recuerden sonreír 😏'
        ],
        noches: [
            '🌙 Buenas noches, que los sueños sean dulces 😼✨',
            '🌌 Que la luna cuide sus sueños 😏',
            '🌟 Descansen todos, que mañana será un gran día 😎'
        ]
    };

    const texto = m.text?.toLowerCase();
    if (!texto || !comandos[texto]) return;

    const mensajes = comandos[texto];
    let index;
    do { index = Math.floor(Math.random() * mensajes.length); } while (index === lastIndex[texto]);
    lastIndex[texto] = index;

    const mensaje = mensajes[index];
    const mentions = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, { text: mensaje, mentions });
};

handler.customPrefix = /^(buendia|tardes|noches)$/i;
handler.owner = true; // solo owners
export default handler;
