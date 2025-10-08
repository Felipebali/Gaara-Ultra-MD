// plugins/antitagall.js
import fs from 'fs';

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
    if (!m.isGroup) return;

    // Cargar estado
    let data = {};
    try { data = JSON.parse(fs.readFileSync('./antitagall.json')) } 
    catch (e) { data = {} }

    // Comando para activar/desactivar antitagall
    if (command === 'antitagall') {
        if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins o dueño pueden usar este comando.');
        data[m.chat] = !data[m.chat];
        fs.writeFileSync('./antitagall.json', JSON.stringify(data));
        return m.reply(`✅ Antitagall ${data[m.chat] ? 'activado' : 'desactivado'} en este grupo.`);
    }

    if (!data[m.chat]) return; // si está desactivado

    if (!m.text) return;

    const texto = m.text.toLowerCase().replace(/\s+/g, '');

    // Patrones típicos del tagall que queremos bloquear
    const patrones = [
        '.tagall',
        'for(letmemofparticipants)',
        'conn.sendmessage(m.chat',
        'participants.map',
        'sendmessage'
    ];

    // Si el mensaje contiene cualquiera de esos patrones, lo borramos
    const encontrado = patrones.some(p => texto.includes(p));
    if (encontrado) {
        await conn.sendMessage(m.chat, { text: '❌ No se permite enviar copias del .tagall del bot.' }, { quoted: m });
        await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat });
    }
};

handler.command = ['antitagall'];
handler.all = true;
export default handler;
