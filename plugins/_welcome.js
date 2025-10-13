export async function onGroupUpdate({ update, conn }) {
    sock.ev.on('group-participants.update', async (update) => {
    console.log('📢 EVENTO PARTICIPANTES:', update);
});
    if (!participants || participants.length === 0) return;

    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    if (!chatData.welcome) {
        console.log('❌ Welcome desactivado para este chat');
        return;
    }

    if (action !== 'add') return;

    for (let who of participants) {
        const username = who.split("@")[0];
        const welcomeMessages = [
            `🎉 Bienvenido/a @${username} al grupo! Disfruta tu estadía.`,
            `👋 Hola @${username}, nos alegra que te unas!`,
            `✨ @${username}, bienvenido/a! Pásala genial aquí.`
        ];

        const text = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        try {
            await conn.sendMessage(chat, { text, mentions: [who] });
            console.log(`✅ Welcome message sent to ${username}`);
        } catch (e) {
            console.error(`❌ Error sending welcome to ${username}:`, e);
        }
    }
}
