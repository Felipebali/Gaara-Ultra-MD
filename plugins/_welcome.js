// plugins/_welcome.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;
    if (action !== 'add') return; // solo entradas

    // Aseguramos que exista la data del chat
    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    for (let user of participants) {
        const who = user; // número con @
        const welcomeMessages = [
            `🎉 Bienvenido/a @${who.split("@")[0]} al grupo! Disfruta tu estadía.`,
            `👋 Hola @${who.split("@")[0]}, nos alegra que te unas!`,
            `✨ @${who.split("@")[0]}, bienvenido/a! Pásala genial aquí.`
        ];
        const text = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        await conn.sendMessage(chat, {
            text,
            mentions: [who] // Solo mención, nada de paréntesis
        });
    }
}
