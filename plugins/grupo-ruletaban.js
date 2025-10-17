// plugins/ruletaban.js

const ownerNumbers = ['59898719147', '59896026646'] // Números de dueños sin "+"

let handler = async (m, { conn }) => {
    try {
        if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.');

        // Obtener metadata del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;

        // Detectar el bot y verificar si es admin
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const botParticipant = participants.find(p => p.id === botJid);
        const isBotAdmin = botParticipant?.admin;
        if (!isBotAdmin) return m.reply('❌ Necesito ser administrador para expulsar miembros.');

        // Detectar si el que ejecuta es admin o dueño
        const senderJid = m.sender;
        const senderId = senderJid.split('@')[0];
        const senderParticipant = participants.find(p => p.id === senderJid);
        const isAdmin = senderParticipant?.admin;
        if (!isAdmin && !ownerNumbers.includes(senderId)) {
            return m.reply('⛔ Solo un administrador o el dueño puede usar este comando.');
        }

        // Filtrar participantes kickables (no admin, no dueño, no bot)
        let kickables = participants.filter(p => 
            !p.admin &&
            !ownerNumbers.includes(p.id.split('@')[0]) &&
            p.id !== botJid
        );

        if (kickables.length === 0) return m.reply('😅 No hay miembros normales disponibles para expulsar.');

        // Elegir uno al azar
        let elegido = kickables[Math.floor(Math.random() * kickables.length)];

        // Mensaje de suspenso
        await conn.sendMessage(m.chat, {
            text: `🎯 *Ruleta Ban Activada...*\n💣 ¡El elegido al azar fue @${elegido.id.split('@')[0]}!\n\n👋 ¡Hasta la próxima!`,
            mentions: [elegido.id]
        });

        await new Promise(resolve => setTimeout(resolve, 3000)); // espera 3 segundos

        // Expulsar
        await conn.groupParticipantsUpdate(m.chat, [elegido.id], 'remove');

    } catch (e) {
        console.error(e);
        m.reply('⚠️ Ocurrió un error ejecutando la ruleta ban.');
    }
}

handler.command = /^ruletaban$/i
handler.group = true
handler.admin = false

export default handler
