// plugins/saludo-owner.js
let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return; // Solo owner puede usarlo

    // Mensajes aleatorios para cada saludo
    const mensajes = {
        'buenos días': [
            '🌅 Buenos días, que tu café esté fuerte y tu ánimo más fuerte aún 😼☕',
            '¡Buenos días! Que el grupo tenga un día épico 😎',
            '☀️ Despierta y brilla, hoy será un gran día 😼'
        ],
        'buenas tardes': [
            '🌇 Buenas tardes, no olviden tomar aire y relajarse un rato 😏',
            '¡Buenas tardes! Que la siesta no los atrape 😼💤',
            '☕ Tarde de mensajes y buen ánimo, disfruten 😎'
        ],
        'buenas noches': [
            '🌙 Buenas noches, que los sueños sean dulces y llenos de locuras 😼✨',
            '¡Buenas noches! Hora de descansar y recargar energía 😴',
            '🌌 Que la luna cuide sus sueños y mañana sea mejor 😼'
        ]
    };

    // Convertir el mensaje original a minúsculas para comparar
    let texto = m.text.toLowerCase();

    if (mensajes[texto]) {
        // Elegir mensaje aleatorio
        let mensajeRandom = mensajes[texto][Math.floor(Math.random() * mensajes[texto].length)];
        await conn.sendMessage(m.chat, { text: mensajeRandom });
    }
};

// Sin prefijo, se activa con el texto exacto
handler.command = ['buenos días','buenas tardes','buenas noches'];
handler.tags = ['owner'];
handler.owner = true;
handler.customPrefix = true; // Sin prefijo
handler.help = ['saludoOwner'];

export default handler;
