// plugins/_despedida.js

// Función que envía mensaje de despedida
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id } = update;
    if (!participants || action !== 'remove') return; // solo salidas

    // ID del chat
    const chat = id?.remoteJid || id;
    if (!chat) return;

    // Revisamos si la despedida está activada en este chat
    const chatData = global.db.data.chats[chat] || {};
    if (!chatData.despedida) return;

    for (let user of participants) {
        const who = user; // viene en formato jid completo

        const goodbyeMessages = [
            `😢 Adiós @${who.split("@")[0]}! Te extrañaremos en el grupo.`,
            `👋 @${who.split("@")[0]} ha salido del grupo. ¡Que te vaya bien!`,
            `💔 @${who.split("@")[0]} ha abandonado el grupo.`
        ];
        const text = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

        await conn.sendMessage(chat, {
            text,
            mentions: [who] // mención correcta
        });
    }
}

// Comando para activar/desactivar despedida
export async function despedidaCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return;
    if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.");

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    // Cambiamos el estado
    chat.despedida = !chat.despedida;

    await conn.sendMessage(m.chat, {
        text: `✅ Despedida ahora está *${chat.despedida ? "activada" : "desactivada"}* en este grupo.`
    });
}
