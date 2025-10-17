import { exec } from 'child_process';

let handler = async (m, { conn }) => {
    const owners = ['59898719147', '59896026646']; // Tus números de owner
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return; // Solo owners

    const emoji = '🐈‍⬛';
    const msm = '⚠️';
    const repoPath = '/data/data/com.termux/files/home/Gaara-Ultra-MD'; // Ruta de tu bot en Termux

    m.reply(`🐾 *Felix-Cat está revisando actualizaciones...* 😼`);

    exec('git fetch origin && git reset --hard origin/main', { cwd: repoPath }, (err, stdout, stderr) => {
        if (err) {
            conn.reply(m.chat, `${msm} No se pudo actualizar.\n💥 Razón: ${err.message}`, m);
            return;
        }

        if (stderr) console.warn('⚠️ Advertencia:', stderr);

        if (stdout.includes('Already up to date') || stdout.trim() === '') {
            conn.reply(m.chat, `${emoji} ¡Ya estás al día, humano! 🐾`, m);
        } else {
            conn.reply(
                m.chat,
                `🌿 *Felix-Cat aplicó los cambios con éxito!* 😸\n\n*Detalles:*\n${stdout}`,
                m
            );
        }
    });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar', 'up'];
handler.rowner = true;

export default handler;
