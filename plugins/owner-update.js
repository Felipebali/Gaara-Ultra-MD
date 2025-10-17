import { exec } from 'child_process';
import fs from 'fs';

let handler = async (m, { conn }) => {
    const emoji = '🐈‍⬛';
    const msm = '⚠️';
    const repoPath = process.cwd(); // ruta de tu bot
    const tmpPath = './tmp';       // carpeta tmp

    // Crear carpeta tmp si no existe
    if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath, { recursive: true });
        console.log('📂 Carpeta tmp creada automáticamente');
    }

    m.reply(`${emoji} Preparando actualización...`);

    exec('git pull', { cwd: repoPath }, (err, stdout, stderr) => {
        if (err) return conn.reply(m.chat, `${msm} Error al actualizar:\n${err.message}`, m);

        const output = stdout + (stderr ? `\n⚠️ Advertencia:\n${stderr}` : '');

        if (stdout.includes('Already up to date.')) {
            conn.reply(m.chat, `${emoji} ¡Ya estás al día!`, m);
        } else {
            conn.reply(m.chat, `🌿 ¡Actualización completada!\n\n${output}`, m);
        }
    });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar', 'up'];
handler.rowner = true;

export default handler;
