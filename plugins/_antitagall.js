// plugins/antitagall.js
import fs from 'fs';

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
    if (!m.isGroup) return;

    // Cargar estado
    let data = {};
    try { 
        data = JSON.parse(fs.readFileSync('./antitagall.json')); 
    } catch (e) { 
        data = {}; 
    }

    // Comando para activar/desactivar antitagall
    if (command === 'antitagall') {
        if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins o dueño pueden usar este comando.');
        data[m.chat] = !data[m.chat];
        fs.writeFileSync('./antitagall.json', JSON.stringify(data));
        return m.reply(`✅ Antitagall ${data[m.chat] ? 'activado' : 'desactivado'} en este grupo.`);
    }

    if (!data[m.chat]) return; // si está desactivado
    if (!m.text) return;
    if (m.key.fromMe) return; // ignorar mensajes del propio bot

    const texto = m.text.toLowerCase().replace(/\s+/g, '');

    // Aquí podés poner un "link" o patrón único que solo aparece en el código original del tagall
    const patrones = [
        '.tagall',
        'for(letmemofparticipants)',
        'conn.sendmessage(m.chat',
        'participants.map',
        'https://tubot.link/tagall', // ejemplo de link único en tu código
        'sendmessage'
    ];

    const encontrado = patrones.some(p => texto.includes(p));
    if (encontrado) {
        // Borra solo el mensaje, no al usuario
        await conn.sendMessage(m.chat, { text: '❌ No se permite enviar copias del .tagall del bot.' }, { quoted: m });
        await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat });
    }
};

handler.command = ['antitagall'];
handler.all = true;
export default handler;
