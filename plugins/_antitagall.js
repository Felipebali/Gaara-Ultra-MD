// plugins/antitagall.js
import fs from 'fs';

let handler = async (m, { conn, usedPrefix, command, isAdmin, isOwner }) => {
    if (!m.isGroup) return;

    // Cargar estado guardado
    let data = {};
    try {
        data = JSON.parse(fs.readFileSync('./antitagall.json'));
    } catch (e) {
        data = {};
    }

    // Comando para activar/desactivar
    if (command === 'antitagall') {
        if (!(isAdmin || isOwner)) return m.reply('❌ Solo administradores o dueño pueden usar este comando.');

        data[m.chat] = !data[m.chat]; // cambia el estado
        fs.writeFileSync('./antitagall.json', JSON.stringify(data));
        return m.reply(`✅ Antitagall ${data[m.chat] ? 'activado' : 'desactivado'} en este grupo.`);
    }

    // Solo revisa si está activado
    if (!data[m.chat]) return;

    // Fragmento representativo del código del .tagall para detectar copias
    const tagallCodeSnippet = `async function handler(m, { conn, groupMetadata }) {`; 
    const mensaje = m.text ? m.text.toLowerCase().replace(/\s+/g, '') : '';
    const codigo = tagallCodeSnippet.toLowerCase().replace(/\s+/g, '');

    if (mensaje.includes(codigo)) {
        // Borra el mensaje sin importar si es admin
        await conn.sendMessage(m.chat, { text: `❌ No se permite enviar copias del .tagall del bot.` }, { quoted: m });
        await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat });
    }
};

handler.command = ['antitagall'];
handler.all = true; // revisa todos los mensajes
export default handler;
