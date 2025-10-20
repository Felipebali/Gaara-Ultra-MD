// plugins/antispam.js
const userSpamData = {};

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isOwner }) {
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antiSpam) return; // Solo si antiSpam está activado

    const who = m.sender; // <-- definimos quien envió el mensaje
    const currentTime = Date.now();
    const timeWindow = 5000; // 5 segundos
    const messageLimit = 5;  // mensajes permitidos en ese tiempo
    const warningLimit = 4;  // número máximo de advertencias antes del kick

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
                warningMessage = `👑 Owner alerta: ${who.split("@")[0]}, estás enviando muchos mensajes pero no puedo kickearte.`;
            } else if (isAdmin) {
                warningMessage = `⚡️ Admin alerta: ${who.split("@")[0]}, demasiados mensajes seguidos, controla el ritmo.`;
            } else {
                // Usuario común
                userData.warnings += 1;

                if (userData.warnings >= warningLimit) {
                    warningMessage = `❌ ${who.split("@")[0]} ha alcanzado la 4ta advertencia por spam. Serás expulsado del grupo.`;
                    
                    // Intentar kickear al usuario
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

                    // Resetear advertencias
                    userData.warnings = 0;
                } else {
                    warningMessage = `🔥 Usuario spameando: ${who.split("@")[0]}, advertencia ${userData.warnings}/${warningLimit}`;
                }
            }

            // Enviar advertencia con mención
            await conn.sendMessage(m.chat, { text: warningMessage, mentions: [who] });

            // Resetear contador de mensajes
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
