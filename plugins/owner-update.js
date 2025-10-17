import { exec } from 'child_process';

let handler = async (m, { conn }) => {
    const emoji = '🐈‍⬛';
    const msm = '⚠️';
    const repoPath = process.cwd(); // ruta de tu bot

    m.reply(`${emoji} Preparando actualización...`);

    exec('git pull', { cwd: repoPath }, (err, stdout, stderr) => {
        if (err) return conn.reply(m.chat, `${msm} Error al actualizar:\n${err.message}`, m);
        if (stderr) console.warn('⚠️ Git advertencia:', stderr);

        if (stdout.includes('Already up to date.')) {
            conn.reply(m.chat, `${emoji} Ya estás al día!`, m);
        } else {
            conn.reply(m.chat, `🌿 ¡Actualización completada!\n\n${stdout}`, m);
        }
    });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar', 'up'];
handler.rowner = true;

export default handler;
