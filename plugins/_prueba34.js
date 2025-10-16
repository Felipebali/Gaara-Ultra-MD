// Handler del comando ".."
let handler = async (m, { command, conn }) => {
    if (command === '..') {
        // Lista de respuestas aleatorias
        const frases = [
            "¡Ya estoy despierto! 😸",
            "Buenos días, humano ☀️😎",
            "Despierto y listo para la acción 💥",
            "¡Miau! Aquí presente 🐾",
            "No me hagas café, ¡ya estoy activo! ☕😼",
            "¡Listo para molestar! 😏",
            "Oye, que no me hables muy fuerte 😹",
            "Zzz... Nah, ya despierto 😸",
            "Arriba, arriba, que el día no espera ⏰",
            "¡Aquí estoy! ¿Qué planes hay? 🤓"
        ];

        // Elegir una frase al azar
        const mensaje = frases[Math.floor(Math.random() * frases.length)];

        await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
    }
};

// Exportar si usas módulos
export default handler;
