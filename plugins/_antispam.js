// plugins/antispam.js
const userSpamData = {};

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isOwner }) {
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antiSpam) return; // Solo si antiSpam está activado

    const who = m.sender;
    const username = who.split("@")[0];
    const currentTime = Date.now();
    const timeWindow = 4000; // 4 segundos
    const messageLimit = 3;  // máximo 3 mensajes en ese tiempo
    const warningLimit = 2;  // 2 advertencias antes de kickear

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
                warningMessage = `👑 _*Owner alerta*_ ⚡️\n@${username}, estás enviando demasiados mensajes, pero no puedo kickearte.`;
            } else if (isAdmin) {
                warningMessage = `⚡️ _*Admin alerta*_ ⚡️\n@${username}, reduce el ritmo de tus mensajes.`;
            } else {
                // Usuario común
                userData.warnings += 1;

                if (userData.warnings >= warningLimit) {
                    warningMessage = `❌ _*Límite de spam alcanzado*_ ⚡️\n@${username} será expulsado por spam.`;

                    try {
                        const groupMetadata = await conn.groupMetadata(m.chat);
                        const botJid = conn.user?.jid || conn.user?.id || '';
                        const botData = groupMetadata.participants.find(p => p.id === botJid);
                        const isBotAdmin = botData?.admin;

                        if (isBotAdmin) {
                            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
                        } else {
                            warningMessage += '\n⚠️ No puedo kickear, no soy admin.';
                        }
                    } catch (err) {
                        warningMessage += `\n⚠️ Error al intentar expulsar: ${err.message}`;
                    }

                    userData.warnings = 0; // reinicia después de expulsar
                } else {
                    warningMessage = `🚨 _*Advertencia por spam*_ ⚡️\n@${username}, evita enviar tantos mensajes.\nAdvertencia ${userData.warnings}/${warningLimit}`;
                }
            }

            // Enviar advertencia con mención clickeable
            await conn.sendMessage(m.chat, { text: warningMessage, mentions: [who] });

            // Reiniciar contador de mensajes
            userData.messageCount = 0;
            userData.lastMessageTime = currentTime;
        }
    } else {
        userData.messageCount = 1;
        userData.lastMessageTime = currentTime;
    }
};

export default handler;
