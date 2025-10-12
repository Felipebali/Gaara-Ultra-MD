// plugins/_despedida.js
export async function onGroupUpdate({ update, conn }) {
    const { participants, action, id: chat } = update;
    if (!participants || action !== 'remove') return; // solo salidas

    // Aseguramos que exista la data del chat
    const chatData = global.db.data.chats[chat] || {};
    if (!chatData.despedida) return; // ❌ Revisar si la despedida está activada

    for (let user of participants) {
        const who = user; // número con @

        const goodbyeMessages = [
            `😢 Adiós @${who.split("@")[0]}! Te extrañaremos en el grupo.`,
            `👋 @${who.split("@")[0]} ha salido del grupo. ¡Que te vaya bien!`,
            `💔 @${who.split("@")[0]} ha abandonado el grupo.`
        ];
        const text = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

        await conn.sendMessage(chat, {
            text,
            mentions: [who] // solo mención
        });
    }
}
