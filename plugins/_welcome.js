// plugins/_welcome.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;

    // Solo nos interesan los que se agregan
    if (action !== 'add') return;

    // Aseguramos que exista la data del chat
    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    // Si no quieres depender de la activación, comenta esta línea
    // if (!chatData.welcome) return;

    for (let user of participants) {
        const name = await conn.getName(user);
        const who = user;

        const welcomeMessages = [
            `🎉 Bienvenido/a @${who.split("@")[0]} (${name}) al grupo! Disfruta tu estadía.`,
            `👋 Hola @${who.split("@")[0]} (${name}), nos alegra que te unas!`,
            `✨ @${who.split("@")[0]} (${name}), bienvenido/a! Pásala genial aquí.`
        ];

        // Elegimos un mensaje al azar
        const text = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        // Enviamos mensaje con mención
        await conn.sendMessage(chat, {
            text,
            mentions: [who]
        });
    }
}
