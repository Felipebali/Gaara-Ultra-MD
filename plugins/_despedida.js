export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;
    if (action !== 'remove') return; // solo salidas

    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    if (!chatData.despedida) return; // ✅ revisar activación

    for (let user of participants) {
        const text = [
            `😢 ¡Adiós @${user.split("@")[0]}! Te extrañaremos.`,
            `👋 @${user.split("@")[0]} ha salido del grupo. ¡Que te vaya bien!`,
            `💔 @${user.split("@")[0]} ha abandonado el grupo.`
        ][Math.floor(Math.random() * 3)];

        await conn.sendMessage(chat, { text, mentions: [user] });
    }
}
