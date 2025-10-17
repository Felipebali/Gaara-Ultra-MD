// plugins/ruletaban.js
let handler = async (m, { conn, isAdmin }) => {
    try {
        if (!m.isGroup) {
            return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' });
        }

        // Verificar si el bot es admin
        const groupMetadata = await conn.groupMetadata(m.chat);
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const botIsAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);

        if (!botIsAdmin) {
            return conn.sendMessage(m.chat, { text: '❌ Necesito ser *ADMIN* para expulsar gente.' });
        }

        if (!isAdmin) {
            return conn.sendMessage(m.chat, { text: '❌ Solo administradores pueden usar este comando.' });
        }

        const participantes = groupMetadata.participants.filter(p => !p.admin && !p.id.includes(conn.user.id));
        if (participantes.length === 0) {
            return conn.sendMessage(m.chat, { text: '😎 No hay víctimas disponibles, todos son admins o bots.' });
        }

        const elegido = participantes[Math.floor(Math.random() * participantes.length)];
        const userJid = elegido.id;

        // Expulsar del grupo
        await conn.groupParticipantsUpdate(m.chat, [userJid], 'remove');

        // Enviar mensaje
        await conn.sendMessage(m.chat, {
            text: `🎯 Te llegó la hora @${userJid.split('@')[0]}, fuera del grupo 💣`,
            mentions: [userJid]
        });

    } catch (e) {
        console.error(e);
        conn.sendMessage(m.chat, { text: '❌ Ocurrió un error ejecutando la ruleta ban.' });
    }
}

handler.command = ['ruletaban'];
handler.group = true;
handler.admin = true;

export default handler;
