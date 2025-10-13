// plugins/antispam.js
const userSpamData = {}

let handler = m => m;

handler.before = async function (m, { conn }) {
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antiSpam) return; // solo si antiSpam está activado

    const sender = m.sender;
    const currentTime = Date.now();
    const timeWindow = 5000; // 5 segundos
    const messageLimit = 5;  // mensajes permitidos en ese tiempo

    if (!(sender in userSpamData)) {
        userSpamData[sender] = { lastMessageTime: currentTime, messageCount: 1 };
        return;
    }

    const userData = userSpamData[sender];
    const timeDifference = currentTime - userData.lastMessageTime;

    if (timeDifference <= timeWindow) {
        userData.messageCount += 1;

        if (userData.messageCount >= messageLimit) {
            // Aviso de spam
            const mention = `@${sender.split("@")[0]}`;
            const warningMessage = `⚡️ _*Mucho Spam*_\nUsuario: ${mention}`;
            await conn.sendMessage(m.chat, { text: warningMessage, mentions: [sender] });

            // Resetear contador
            userData.messageCount = 0;
            userData.lastMessageTime = currentTime;
        }
    } else {
        // Resetear contador si pasó suficiente tiempo
        userData.messageCount = 1;
        userData.lastMessageTime = currentTime;
    }
}

export default handler;
