// plugins/saludo-owner.js
let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return; // Solo owner puede usarlo
    if (!m.isGroup) return; // Solo funciona en grupos

    // Mensajes aleatorios para cada saludo
    const mensajes = {
        'buenos días': [
            '🌅 Buenos días a todos, que su café esté fuerte y su ánimo más fuerte 😼☕',
            '¡Buenos días! Que el grupo tenga un día épico 😎',
            '☀️ Despierten y brillen, hoy será un gran día 😼'
        ],
        'buenas tardes': [
            '🌇 Buenas tardes, respiren profundo y relájense un rato 😏',
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
        // Elegir mensaje aleatorio
        let mensajeRandom = mensajes[texto][Math.floor(Math.random() * mensajes[texto].length)];

        // Obtener todos los participantes para mención oculta
        let groupMetadata = await conn.groupMetadata(m.chat);
        let mentions = groupMetadata.participants.map(u => u.id);

        // Enviar mensaje con mención oculta
        await conn.sendMessage(m.chat, {
            text: mensajeRandom,
            mentions: mentions,
            contextInfo: { mentionedJid: mentions } // mantiene la mención oculta
        });
    }
};

// Regex evita el error de str.replace en handler.js
handler.command = /^(buenos días|buenas tardes|buenas noches)$/i;
handler.tags = ['owner'];
handler.owner = true;
handler.customPrefix = true; // sin prefijo
handler.help = ['saludoOwner'];

export default handler;
