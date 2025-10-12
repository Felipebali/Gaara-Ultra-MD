export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;
    if (action !== 'add') return; // solo entradas

    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    if (!chatData.welcome) return; // ✅ revisar activación

    for (let user of participants) {
        const text = [
            `🎉 Bienvenido/a @${user.split("@")[0]} al grupo! Disfruta tu estadía.`,
            `👋 Hola @${user.split("@")[0]}, nos alegra que te unas!`,
            `✨ @${user.split("@")[0]}, bienvenido/a! Pásala genial aquí.`
        ][Math.floor(Math.random() * 3)];

        await conn.sendMessage(chat, { text, mentions: [user] });
    }
}
