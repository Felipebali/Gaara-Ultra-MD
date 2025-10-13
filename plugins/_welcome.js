// plugins/_welcome.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;

    console.log('📢 Group update detected:', { action, participants, chat });

    if (!participants || participants.length === 0) return; // Si no hay participantes, salir

    // Asegurarse que exista la data del chat
    if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
    const chatData = global.db.data.chats[chat];

    // Si welcome no está activado, no hacer nada
    if (!chatData.welcome) return;

    // Solo acción de agregar participantes
    if (action !== 'add') return;

    // Recorrer todos los participantes nuevos
    for (let who of participants) {
        const username = who.split("@")[0]; // Nombre para mostrar en el mensaje

        // Mensajes de bienvenida aleatorios
        const welcomeMessages = [
            `🎉 Bienvenido/a @${username} al grupo! Disfruta tu estadía.`,
            `👋 Hola @${username}, nos alegra que te unas!`,
            `✨ @${username}, bienvenido/a! Pásala genial aquí.`
        ];

        const text = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        try {
            // Enviar mensaje con mención
            await conn.sendMessage(chat, { text, mentions: [who] });
            console.log(`✅ Welcome message sent to ${username}`);
        } catch (e) {
            console.error(`❌ Error sending welcome to ${username}:`, e);
        }
    }
}
