// plugins/wakeUp.js
let handler = async (m, { conn, usedPrefix, command }) => {
    // Verifica que el comando sea exactamente ".."
    if (usedPrefix + command === '..') {
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

        const mensaje = frases[Math.floor(Math.random() * frases.length)];
        await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
    }
};

// Para que lo reconozca el sistema de plugins
handler.command = ['..']; // nombre del comando
handler.rowner = false;    // si solo lo puede usar el dueño
handler.group = false;     // si solo funciona en grupos
export default handler;
