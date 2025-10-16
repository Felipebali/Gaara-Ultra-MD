// Variable para guardar el último mensaje usado
let lastShIndex = -1;

let handler = async (m, { conn, participants }) => {
    // Números de owners
    const owners = global.owner.map(o => o[0]);

    // Solo continuar si el que manda es owner
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return; // NO hace nada si no es owner

    // Comando sin prefijo: "buenas"
    if (m.text && m.text.toLowerCase() === 'buenas') {
        const mensajes = [
            "🌅 ¡Buenos días! Que el café esté fuerte y la paciencia también 😎",
            "☀️ Buen día! A comerse el mundo con estilo 😏",
            "😴 Despierten, el mundo no se va a conquistar solo! 🌄",
            "🌇 Buenas tardes! Hora de brillar aunque el sol esté en pausa 😎",
            "😏 Tarde tranquila, tomen un mate y disfruten 😌",
            "☀️ ¡Hola grupo! Que la tarde les traiga buena vibra 🌤️",
            "🌙 Buenas noches! Que los sueños sean más divertidos que la vida real 😴",
            "💤 Descansen, mi creador necesita paz y silencio 😇",
            "🌌 Dulces sueños a todos! Que la luna cuide sus travesuras 😏",
            "✨ Buenas noches! Que las estrellas iluminen sus sueños más locos 🌟"
        ];

        // Elegir un índice aleatorio que no sea igual al último
        let index;
        do {
            index = Math.floor(Math.random() * mensajes.length);
        } while (index === lastShIndex);
        lastShIndex = index; // guardar el índice actual

        const mensaje = mensajes[index];

        // Menciones ocultas: array de JID de todos los participantes
        const mentions = participants.map(p => p.jid);

        // Enviar mensaje con menciones ocultas
        await conn.sendMessage(m.chat, { text: mensaje, mentions });
    }
};

// Configuración del plugin
handler.customPrefix = /^buenas$/i; // detecta solo "buenas" sin prefijo
handler.command = new RegExp(); // vacío porque no usa prefijo
handler.owner = true; // solo owners
export default handler;
