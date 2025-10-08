// plugins/antitagall.js
import fs from 'fs';

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
    if (!m.isGroup) return;

    // Cargar estado guardado
    let data = {};
    try { 
        data = JSON.parse(fs.readFileSync('./antitagall.json')); 
    } catch (e) { 
        data = {}; 
    }

    // Comando para activar/desactivar antitagall
    if (command === 'antitagall') {
        if (!(isAdmin || isOwner)) return m.reply('❌ Solo administradores o dueño pueden usar este comando.');

        data[m.chat] = !data[m.chat]; // alterna el estado
        fs.writeFileSync('./antitagall.json', JSON.stringify(data));
        return m.reply(`✅ Antitagall ${data[m.chat] ? 'activado' : 'desactivado'} en este grupo.`);
    }

    if (!data[m.chat]) return; // si está desactivado, no hace nada

    // Detectar mensajes que mencionan a todos los participantes
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participantes = groupMetadata.participants.map(u => u.id);

    if (m.mentionedJid && participantes.every(p => m.mentionedJid.includes(p))) {
        // Borra el mensaje incluso si es admin
        await conn.sendMessage(m.chat, { text: `❌ No se permite enviar un tagall copiado del bot.` }, { quoted: m });
        await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat });
    }
};

handler.command = ['antitagall'];
handler.all = true; // revisa todos los mensajes
export default handler;
