sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return; // Ignorar mensajes vacíos o propios

    const text = m.message.conversation || m.message.extendedTextMessage?.text;
    if (!text) return;

    // Lista de números de owners (sin + ni espacios)
    const owners = ['59896026646', '59898719147']; 

    // Detectar comando "f"
    if (text === 'f') {
        const senderNumber = m.key.participant || m.key.remoteJid.split('@')[0];

        // Solo si es owner
        if (!owners.includes(senderNumber)) return;

        // Frases aleatorias
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

        await sock.sendMessage(m.key.remoteJid, { text: mensaje }, { quoted: m });
    }
});
