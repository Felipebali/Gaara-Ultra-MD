// plugins/_despedida.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;
    if (action !== 'remove') return; // solo salidas

    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};

    for (let user of participants) {
        // Mensajes de despedida sin paréntesis
        const goodbyeMessages = [
            `😢 ¡Adiós @${user.split("@")[0]}! Te extrañaremos.`,
            `👋 @${user.split("@")[0]} ha salido del grupo. ¡Que te vaya bien!`,
            `💔 @${user.split("@")[0]} ha abandonado el grupo.`
        ];

        const text = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

        await conn.sendMessage(chat, {
            text,
            mentions: [user] // WhatsApp mostrará automáticamente el nombre correcto
        });
    }
}
