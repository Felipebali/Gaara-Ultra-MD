// plugins/antispam.js
const userSpamData = {};

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isOwner }) {
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antiSpam) return; // Solo si el antiSpam está activado

    const who = m.sender;
    const currentTime = Date.now();
    const timeWindow = 4000; // 4 segundos
    const messageLimit = 3;  // máximo 3 mensajes en ese tiempo
    const warningLimit = 2;  // 2 advertencias antes del kick

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
            const mention = `@${who.split('@')[0]}`;

            if (isOwner) {
                warningMessage = `👑 *Owner alerta*\n${mention}, estás enviando demasiados mensajes, pero no puedo kickearte.`;
            } else if (isAdmin) {
                warningMessage = `⚡️ *Admin alerta*\n${mention}, estás enviando mensajes demasiado rápido.`;
            } else {
                userData.warnings += 1;

                if (userData.warnings >= warningLimit) {
                    warningMessage = `❌ *Límite de spam alcanzado*\n${mention} será expulsado automáticamente por spam.`;

                    try {
                        const groupMetadata = await conn.groupMetadata(m.chat);
                        const botNumber = conn.user?.id || conn.user?.jid;
                        const botData = groupMetadata.participants.find(p => p.id === botNumber);
                        const isBotAdmin = botData?.admin;

                        if (isBotAdmin) {
                            // 🦶 Kick inmediato
                            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
                            await conn.sendMessage(m.chat, {
                                text: `🚫 ${mention} fue *expulsado automáticamente* por hacer spam.`,
                                mentions: [who]
                            });
                        } else {
                            warningMessage += `\n⚠️ No puedo kickear, no soy admin.`;
                            await conn.sendMessage(m.chat, { text: warningMessage, mentions: [who] });
                        }
                    } catch (err) {
                        await conn.sendMessage(m.chat, {
                            text: `⚠️ Error al intentar expulsar a ${mention}: ${err.message}`,
                            mentions: [who]
                        });
                    }

                    userData.warnings = 0; // reinicia después del kick
                } else {
                    warningMessage = `🚨 *Advertencia por spam*\n${mention}, evita enviar tantos mensajes.\n⚠️ Advertencia ${userData.warnings}/${warningLimit}`;
                    await conn.sendMessage(m.chat, { text: warningMessage, mentions: [who] });
                }
            }

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
