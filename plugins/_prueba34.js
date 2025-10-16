let handler = async (m, { conn, isOwner }) => {
    // Solo owner
    if (!isOwner) return;

    const text = m.text || m.message?.conversation;
    if (text !== 'f') return;

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
};

handler.command = ['f']; // comando
handler.rowner = true;   // solo para owner
handler.group = false;   // funciona en chats privados o grupos
export default handler;
