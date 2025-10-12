// plugins/_despedida.js

// Handler de despedida
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;

    // Solo nos interesan los que se van
    if (action !== 'remove') return;

    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    // Revisar si la despedida está activada
    if (!chatData.goodbye) return;

    for (let user of participants) {
        const name = await conn.getName(user);
        const isAdmin = (await conn.groupMetadata(chat))
            .participants.some(p => p.id === user && (p.isAdmin || p.isSuperAdmin));

        // Mensajes distintos según sea admin o usuario común
        const goodbyeMessages = isAdmin
            ? [
                `👑 El admin @${user.split("@")[0]} (${name}) se va. ¡Hasta luego, jefe!`,
                `⚠️ Admin @${user.split("@")[0]} (${name}) ha abandonado el grupo.`
            ]
            : [
                `😢 Adiós @${user.split("@")[0]} (${name})! Te extrañaremos.`,
                `👋 @${user.split("@")[0]} (${name}) ha salido del grupo. ¡Que te vaya bien!`
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
