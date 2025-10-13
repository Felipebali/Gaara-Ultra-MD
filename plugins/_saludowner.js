// plugins/saludos-owner.js
const mensajes = {
    'buendia': [
        '🌅 Buenos días a todos, que su café esté fuerte y su ánimo más fuerte 😼☕',
        '¡Buenos días! Que el grupo tenga un día épico 😎',
        '☀️ Despierten y brillen, hoy será un gran día 😼'
    ],
    'tardes': [
        '🌇 Buenas tardes, respiren profundo y relájense un rato 😏',
        '¡Buenas tardes! Que la siesta no los atrape 😼💤',
        '☕ Tarde de mensajes y buen ánimo, disfruten 😎'
    ],
    'noches': [
        '🌙 Buenas noches, que los sueños sean dulces y llenos de locuras 😼✨',
        '¡Buenas noches! Hora de descansar y recargar energía 😴',
        '🌌 Que la luna cuide sus sueños y mañana sea mejor 😼'
    ]
};

const crearHandler = (saludo) => {
    let handler = async (m, { conn, isOwner }) => {
        if (!isOwner) return; // solo owner
        if (!m.isGroup) return; // solo grupos

        let mensajesSaludo = mensajes[saludo];
        let mensajeRandom = mensajesSaludo[Math.floor(Math.random() * mensajesSaludo.length)];

        let groupMetadata = await conn.groupMetadata(m.chat);
        let mentions = groupMetadata.participants.map(u => u.id);

        await conn.sendMessage(m.chat, {
            text: mensajeRandom,
            mentions: mentions,
            contextInfo: { mentionedJid: mentions } // mención oculta
        });
    };

    handler.command = saludo; // comando simple
    handler.customPrefix = true; // sin prefijo
    handler.tags = ['owner'];
    handler.owner = true;
    handler.help = [`saludoOwner-${saludo}`];

    return handler;
};

// Exportamos los 3 comandos en el mismo plugin
export default [
    crearHandler('buendia'),
    crearHandler('tardes'),
    crearHandler('noches')
];
