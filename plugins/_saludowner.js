let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return;
    if (!m.isGroup) return;

    const mensajes = {
        'buenos días': [
            '🌅 Buenos días a todos, que su café esté fuerte y su ánimo más fuerte 😼☕',
            '¡Buenos días! Que el grupo tenga un día épico 😎',
            '☀️ Despierten y brillen, hoy será un gran día 😼'
        ],
        'buenas tardes': [
            '🌇 Buenas tardes, respiren profundo y relajense un rato 😏',
            '¡Buenas tardes! Que la siesta no los atrape 😼💤',
            '☕ Tarde de mensajes y buen ánimo, disfruten 😎'
        ],
        'buenas noches': [
            '🌙 Buenas noches, que los sueños sean dulces y llenos de locuras 😼✨',
            '¡Buenas noches! Hora de descansar y recargar energía 😴',
            '🌌 Que la luna cuide sus sueños y mañana sea mejor 😼'
        ]
    };

    let texto = m.text.toLowerCase();

    if (mensajes[texto]) {
        let mensajeRandom = mensajes[texto][Math.floor(Math.random() * mensajes[texto].length)];
        let groupMetadata = await conn.groupMetadata(m.chat);
        let mentions = groupMetadata.participants.map(u => u.id);

        await conn.sendMessage(m.chat, {
            text: mensajeRandom,
            mentions: mentions,
            contextInfo: { mentionedJid: mentions }
        });
    }
};

// Regex evita el error de str.replace
handler.command = /^(buenos días|buenas tardes|buenas noches)$/i;
handler.tags = ['owner'];
handler.owner = true;
handler.customPrefix = true;
handler.help = ['saludoOwner'];

export default handler;
