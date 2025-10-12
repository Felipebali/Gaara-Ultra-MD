// plugins/_despedida.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;

    // Solo nos interesan los que se van
    if (action !== 'remove') return;

    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    const goodbyeMessages = [
        `😢 Adiós @${participants[0].split("@")[0]} (${await conn.getName(participants[0])})! Te extrañaremos en el grupo.`,
        `👋 @${participants[0].split("@")[0]} (${await conn.getName(participants[0])}) se despide. ¡Hasta pronto!`,
        `💔 @${participants[0].split("@")[0]} (${await conn.getName(participants[0])}) ha salido del grupo. Que te vaya bien!`
    ];

    const text = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

    await conn.sendMessage(chat, {
        text,
        mentions: participants
    });
}
