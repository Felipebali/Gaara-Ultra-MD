// plugins/ruletaban.js
let handler = async (m, { conn, groupMetadata, isAdmin }) => {
    try {
        if (!m.isGroup) {
            return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' });
        }
        if (!isAdmin) {
            return conn.sendMessage(m.chat, { text: '❌ Solo administradores pueden usar este comando.' });
        }

        const participantes = groupMetadata.participants.filter(p => !p.admin && !p.bot);
        if (participantes.length === 0) {
            return conn.sendMessage(m.chat, { text: 'Sos 🫎 o que onda? No ves que no hay nadie.' });
        }

        const elegido = participantes[Math.floor(Math.random() * participantes.length)];
        const userJid = elegido.id;

        // Expulsar del grupo
        await conn.groupParticipantsUpdate(m.chat, [userJid], 'remove');

        // Enviar mensaje SIN citar
        await conn.sendMessage(m.chat, {
            text: `🎯 Te llegó la hora @${userJid.split('@')[0]}, me caes mal. Chao 👋🏻`,
            mentions: [userJid]
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error ejecutando la ruleta ban.' });
    }
}

handler.command = ['ruletaban'];
handler.group = true;
handler.admin = true;

export default handler;
