//plugins/_welcome.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || action !== 'add') return;

    const chatData = global.db.data.chats[chat] || {};
    if (!chatData.welcome) return; // check de configuración

    for (let user of participants) {
        const who = user;
        const welcomeMessages = [
            `🎉 Bienvenido/a @${who.split("@")[0]} al grupo! Disfruta tu estadía.`,
            `👋 Hola @${who.split("@")[0]}, nos alegra que te unas!`,
            `✨ @${who.split("@")[0]}, bienvenido/a! Pásala genial aquí.`
        ];
        const text = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        await conn.sendMessage(chat, { text, mentions: [who] });
    }
}
