// plugins/_handlerNoExiste.js
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Solo ejecuta si empieza con el prefijo
        if (!m.text.startsWith(usedPrefix)) return;

        // Carpeta de plugins
        const pluginsDir = './plugins';

        // Lista de comandos válidos
        let comandosValidos = [];

        // Recorremos los archivos de plugins
        const archivos = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        for (let file of archivos) {
            const pluginPath = path.join(process.cwd(), pluginsDir, file);
            try {
                const plugin = await import(`file://${pluginPath}`);
                if (plugin.command) {
                    if (Array.isArray(plugin.command)) comandosValidos.push(...plugin.command);
                    else comandosValidos.push(plugin.command);
                }
            } catch (e) {
                // Si algún plugin falla, lo ignoramos para no romper todo
                continue;
            }
        }

        // Si el comando no existe, enviamos mensaje
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

handler.command = ['']; // Se ejecuta para cualquier comando
handler.register = true;

export default handler;
