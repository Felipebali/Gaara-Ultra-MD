// plugins/ruletaban.js
import { jidNormalizedUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    try {
        // 1️⃣ Solo grupos
        if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' });

        // 2️⃣ Metadata del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;

        // 3️⃣ Verificar admin bot
        const botNumber = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
        const botAdmin = participants.find(p => p.id === botNumber)?.admin;
        if (!botAdmin) return conn.sendMessage(m.chat, { text: '❌ Necesito ser ADMIN para expulsar gente.' });

        // 4️⃣ Verificar admin usuario que ejecuta
        const sender = m.sender;
        const senderAdmin = participants.find(p => p.id === sender)?.admin;
        if (!senderAdmin) return conn.sendMessage(m.chat, { text: '❌ Solo admins pueden usar este comando.' });

        // 5️⃣ Filtrar posibles víctimas
        const victimas = participants.filter(p => !p.admin && p.id !== botNumber);
        if (victimas.length === 0) return conn.sendMessage(m.chat, { text: '😐 No hay a quién expulsar, todos son admins o bots.' });

        // 6️⃣ Elegir al azar
        const elegido = victimas[Math.floor(Math.random() * victimas.length)];
        const userJid = jidNormalizedUser(elegido.id);

        // 7️⃣ Girando la ruleta
        await conn.sendMessage(m.chat, { text: '🎯 Girando la ruleta... 🔫' });
        await delay(1500);

        // 8️⃣ Intentar expulsar
        try {
            await conn.groupParticipantsUpdate(m.chat, [userJid], 'remove');

            await conn.sendMessage(m.chat, {
                text: `💀 La mala suerte eligió a @${userJid.split('@')[0]}... fuera del grupo 🚪😂`,
                mentions: [userJid]
            });
        } catch {
            await conn.sendMessage(m.chat, {
                text: `⚠️ No pude expulsar a @${userJid.split('@')[0]} (posible protección o bloqueo de WhatsApp)`,
                mentions: [userJid]
            });
        }

    } catch (e) {
        console.log(e);
        conn.sendMessage(m.chat, { text: '⚠️ Error ejecutando la ruleta ban.' });
    }
};

// Comando
handler.command = ['ruletaban', 'rban', 'ruletakick'];
handler.group = true;
export default handler;

// Delay para suspenso
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
