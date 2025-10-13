// plugins/buendia.js
let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return;
    if (!m.isGroup) return;

    const mensajes = [
        '🌅 Buenos días a todos, que su café esté fuerte y su ánimo más fuerte 😼☕',
        '¡Buenos días! Que el grupo tenga un día épico 😎',
        '☀️ Despierten y brillen, hoy será un gran día 😼',
        'Buenos días, que hoy solo entren cosas buenas al grupo 😏',
        '¡Arriba! Que la mañana esté llena de risas y buena onda 😼',
        '🌄 Buen día a todos, prepárense para conquistar el mundo 😎'
    ];

    let mensajeRandom = mensajes[Math.floor(Math.random() * mensajes.length)];

    let groupMetadata = await conn.groupMetadata(m.chat);
    let mentions = groupMetadata.participants.map(u => u.id);

    await conn.sendMessage(m.chat, {
        text: mensajeRandom,
        mentions: mentions,
        contextInfo: { mentionedJid: mentions }
    });
};

handler.command = 'buendia';
handler.customPrefix = true;
handler.tags = ['owner'];
handler.owner = true;
handler.help = ['saludoOwner-buendia'];

export default handler;
