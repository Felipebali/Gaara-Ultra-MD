// plugins/_despedida.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;
    if (action !== 'remove') return; // solo salidas

    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];
    if (chatData.despedida === undefined) chatData.despedida = true; // default activado

    if (!chatData.despedida) return;

    for (let who of participants) {
        const msgs = [
            `@${who.split("@")[0]} salió del grupo`,
            `Adiós @${who.split("@")[0]}`,
            `Hasta luego @${who.split("@")[0]}`
        ];
        const text = msgs[Math.floor(Math.random() * msgs.length)];
        await conn.sendMessage(chat, { text, mentions: [who] });
    }
}

// Comando para activar/desactivar despedida
export async function despedidaCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return;
    if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.");

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    chat.despedida = !chat.despedida;

    await conn.sendMessage(m.chat, { 
        text: `✅ Mensajes de despedida ahora están *${chat.despedida ? "activados" : "desactivados"}*.`
    });
}

despedidaCommand.command = ['despedida'];
despedidaCommand.tags = ['group'];
export default despedidaCommand;
