// plugins/handlerNoExiste.js
let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const pluginsDir = './plugins';

        // Inicializa la base de datos si no existe
        if (!global.db) global.db = { data: { chats: {} } };
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { noExiste: true }; // ACTIVADO POR DEFECTO

        // Recolectamos todos los comandos válidos
        const archivos = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        const comandosValidos = [];
        for (let file of archivos) {
            let plugin = require(path.join(__dirname, file));
            if (plugin && plugin.command) {
                if (Array.isArray(plugin.command)) comandosValidos.push(...plugin.command);
                else comandosValidos.push(plugin.command);
            }
        }

        // Si el comando no existe, envía el mensaje
        if (!comandosValidos.includes(command)) {
            await conn.sendMessage(
                m.chat,
                `❌ Este comando no existe boludo.\nUsa *${usedPrefix}menu* para ver los comandos disponibles.`,
                { quoted: m }
            );
        }
    } catch (e) {
        console.error(e);
    }
};

handler.command = ['']; // Se ejecuta para cualquier comando
handler.register = true;

module.exports = handler;
