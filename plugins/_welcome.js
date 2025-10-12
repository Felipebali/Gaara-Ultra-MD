// plugins/welcome.js
export async function onAdd(m, { conn }) {
    if (!m.isGroup) return; // solo grupos
    if (!m.addedParticipants || m.addedParticipants.length === 0) return;

    const chat = m.chat;
    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    if (!chatData.welcome) return; // si el welcome está desactivado, no hace nada

    for (let user of m.addedParticipants) {
        const name = await conn.getName(user); // nombre del usuario agregado
        const who = user; // el ID completo del usuario

        const welcomeMessages = [
            `🎉 Bienvenido/a @${who.split("@")[0]} (${name}) al grupo! Disfruta tu estadía.`,
            `👋 Hola @${who.split("@")[0]} (${name}), nos alegra que te unas!`,
            `✨ @${who.split("@")[0]} (${name}), bienvenido/a! Pásala genial aquí.`
        ];

        // Elegimos un mensaje aleatorio
        const text = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        await conn.sendMessage(chat, {
            text,
            mentions: [who]
        });
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
