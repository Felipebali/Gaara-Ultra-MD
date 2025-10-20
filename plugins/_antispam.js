// plugins/antispam.js
const userSpamData = {};

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isOwner }) {
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antiSpam) return; // Solo si antiSpam está activado

    const who = m.sender;
    const username = who.split("@")[0]; // solo el nombre antes de @
    const currentTime = Date.now();
    const timeWindow = 5000; // 5 segundos
    const messageLimit = 5;  // mensajes permitidos en ese tiempo
    const warningLimit = 4;  // límite de advertencias antes del kick

    if (!(who in userSpamData)) {
        userSpamData[who] = { lastMessageTime: currentTime, messageCount: 1, warnings: 0 };
        return;
    }

    const userData = userSpamData[who];
    const timeDifference = currentTime - userData.lastMessageTime;

    if (timeDifference <= timeWindow) {
        userData.messageCount += 1;

        if (userData.messageCount >= messageLimit) {
            let warningMessage = '';

            if (isOwner) {
                warningMessage = `👑 _*Owner alerta*_ ⚡️\nUsuario: @${username}\n¡Estás enviando muchos mensajes pero no puedo kickearte!`;
            } else if (isAdmin) {
                warningMessage = `⚡️ _*Admin alerta*_ ⚡️\nUsuario: @${username}\nDemasiados mensajes seguidos, controla el ritmo.`;
            } else {
                // Usuario común
                userData.warnings += 1;

                if (userData.warnings >= warningLimit) {
                    warningMessage = `❌ _*Límite de spam alcanzado*_ ⚡️\nUsuario: @${username}\nSerás expulsado del grupo.`;

                    try {
                        const groupMetadata = await conn.groupMetadata(m.chat);
                        const isBotAdmin = groupMetadata.participants.find(p => p.jid === conn.user.jid)?.admin;
                        if (isBotAdmin) {
                            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
                        } else {
                            warningMessage += '\n⚠️ No puedo kickear, no soy admin.';
                        }
                    } catch (err) {
                        warningMessage += `\n⚠️ Error al kickear: ${err.message}`;
                    }

                    userData.warnings = 0; // reset
                } else {
                    warningMessage = `🔥 _*Mucho Spam*_ ⚡️\nUsuario: @${username}\nAdvertencia ${userData.warnings}/${warningLimit}`;
                }
            }

            // Enviar advertencia con mención real
            await conn.sendMessage(m.chat, { text: warningMessage, mentions: [who] });

            userData.messageCount = 0;
            userData.lastMessageTime = currentTime;
        }
    } else {
        userData.messageCount = 1;
        userData.lastMessageTime = currentTime;
    }
}

export default handler;
