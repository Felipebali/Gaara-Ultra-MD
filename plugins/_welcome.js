// plugins/_welcome.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || !participants.length) return;
    if (action !== 'add') return; // solo entradas

    // Inicializar DB
    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];
    if (chatData.welcome === undefined) chatData.welcome = true; // default activado

    if (!chatData.welcome) return; // si está desactivado, no hace nada

    const groupName = chat; // opcional: reemplazar con nombre real si querés
    for (let who of participants) {
        const msgs = [
            `@${who.split("@")[0]} se unió al grupo`,
            `Bienvenido/a @${who.split("@")[0]}`,
            `Hola @${who.split("@")[0]}, disfruta tu estadía`
        ];
        const text = msgs[Math.floor(Math.random() * msgs.length)];
        await conn.sendMessage(chat, { text, mentions: [who] });
    }
}

// Comando para activar/desactivar welcome
export async function welcomeCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return;
    if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.");

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    chat.welcome = !chat.welcome;

    await conn.sendMessage(m.chat, { 
        text: `✅ Mensajes de bienvenida ahora están *${chat.welcome ? "activados" : "desactivados"}*.`
    });
}

welcomeCommand.command = ['welcome'];
welcomeCommand.tags = ['group'];
export default welcomeCommand;
