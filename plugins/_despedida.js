// plugins/_despedida.js

// Handler de despedida
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;
    if (action !== 'remove') return; // solo salidas

    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    // Si despedida no está activada, no hace nada
    if (!chatData.goodbye) return;

    for (let user of participants) {
        const goodbyeMessages = [
            `😢 ¡Adiós @${user.split("@")[0]}! Te extrañaremos.`,
            `👋 @${user.split("@")[0]} ha salido del grupo. ¡Que te vaya bien!`,
            `💔 @${user.split("@")[0]} ha abandonado el grupo.`
        ];

        const text = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

        await conn.sendMessage(chat, {
            text,
            mentions: [user]
        });
    }
}

// Comando para activar/desactivar despedida
export async function despedidaCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return;
    if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.");

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    chat.goodbye = !chat.goodbye;

    await conn.sendMessage(m.chat, { 
        text: `✅ Mensajes de despedida ahora están *${chat.goodbye ? "activados" : "desactivados"}*.`
    });
}

despedidaCommand.command = ['goodbye','despedida'];
despedidaCommand.tags = ['group'];
export default despedidaCommand;
