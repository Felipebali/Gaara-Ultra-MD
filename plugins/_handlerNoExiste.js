// plugins/_handlerNoExiste.js
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    try {
        // Solo procesamos mensajes que parezcan comandos
        if (!m.text || !m.text.startsWith(usedPrefix)) return;

        // Extraemos el comando escrito
        const command = m.text.slice(usedPrefix.length).split(/\s+/)[0].toLowerCase();

        // Carpeta de plugins
        const pluginsDir = './plugins';

        // Lista de comandos válidos
        const comandosValidos = [];

        // Recorremos todos los plugins
        const archivos = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js') && file !== '_handlerNoExiste.js');
        for (const file of archivos) {
            const pluginPath = path.join(process.cwd(), pluginsDir, file);
            try {
                const plugin = await import(`file://${pluginPath}`);
                if (plugin.command) {
                    if (Array.isArray(plugin.command)) comandosValidos.push(...plugin.command.map(c => c.toLowerCase()));
                    else comandosValidos.push(plugin.command.toLowerCase());
                }
            } catch (e) {
                continue;
            }
        }

        // Si el comando NO existe, enviamos mensaje
        if (!comandosValidos.includes(command)) {
            await conn.sendMessage(
                m.chat,
                `❌ Este comando no existe boludo.\nUsa *${usedPrefix}menu* para ver los comandos disponibles.`,
                { quoted: m }
            );
        }

    } catch (e) {
        console.error('Error en _handlerNoExiste:', e);
    }
};

// Este handler se ejecuta en todos los mensajes
handler.custom = true;

export default handler;
