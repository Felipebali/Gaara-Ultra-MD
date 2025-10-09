// plugins/ruletaban.js
let handler = async (m, { conn, groupMetadata, isAdmin }) => {
    try {
        if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
        if (!isAdmin) return m.reply('❌ Solo administradores pueden usar este comando.');

        const participantes = groupMetadata.participants.filter(p => !p.admin && !p.bot); // filtra usuarios normales
        if (participantes.length === 0) return m.reply('Sos 🫎 o que onda? No ves que no hay nadie.');

        // Elegir usuario al azar
        const elegido = participantes[Math.floor(Math.random() * participantes.length)];
        const userJid = elegido.id;
        const userName = elegido.notify || elegido.name || userJid.split('@')[0];

        // Expulsar del grupo
        await conn.groupParticipantsUpdate(m.chat, [userJid], 'remove');

        // Avisar al grupo mencionando al usuario expulsado
        await conn.sendMessage(m.chat, {
            text: `🎯 Te llegó la hora @${userJid.split('@')[0]} me caes mal Chao 👋🏻.`,
            mentions: [userJid]
        });

    } catch (e) {
        console.error(e);
        await m.reply('❌ Ocurrió un error ejecutando la ruleta ban.');
    }
}

handler.command = ['ruletaban'];
handler.group = true;
handler.admin = true;

export default handler;
