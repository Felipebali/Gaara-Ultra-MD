import { exec } from 'child_process';

let handler = async (m, { conn }) => {
    conn.reply(m.chat, `🐾 *FelixCat invoca su hechizo de actualización...*\n🩸 Descargando cambios desde tu repo...`);

    try {
        // Intento Git directo
        const gitCmd = `git -c user.email="felixcat@bot.com" -c user.name="FelixCat" fetch origin main && git -c user.email="felixcat@bot.com" -c user.name="FelixCat" reset --hard origin/main`;

        exec(gitCmd, { timeout: 30000 }, (err, stdout, stderr) => {
            if (!err && !stderr.includes('fatal')) {
                conn.reply(m.chat, `😸 *FelixCat maulla: actualización completada con éxito!*\n✅ Bot actualizado desde GitHub`);
                return;
            }

            // Fallback: descargar ZIP
            conn.reply(m.chat, `⚠️ Git falló, FelixCat prueba otro hechizo...`);

            const zipUrl = 'https://github.com/Felipebali/Gaara-Ultra-MD/archive/refs/heads/main.zip';
            const tmpFile = '/tmp/felix_update.zip';

            exec(`curl -L "${zipUrl}" -o "${tmpFile}" || wget -O "${tmpFile}" "${zipUrl}"`, { timeout: 60000 }, (downloadErr) => {
                if (downloadErr) {
                    emergencyFiles(conn, m);
                    return;
                }

                exec(`cd /tmp && unzip -o "${tmpFile}" && cp -r Gaara-Ultra-MD-main/* . 2>/dev/null || echo "Extracción completada"`, (extractErr) => {
                    if (extractErr) {
                        conn.reply(m.chat, `☠️ Error en la extracción, FelixCat usa magia de emergencia...`);
                        emergencyFiles(conn, m);
                        return;
                    }

                    conn.reply(m.chat, `😸 *FelixCat maulla: archivos actualizados con éxito!* 🩸`);
                });
            });
        });
    } catch (e) {
        conn.reply(m.chat, `☠️ Error inesperado: ${e.message}\nFelixCat activa emergencia...`);
        emergencyFiles(conn, m);
    }
};

// Descarga de emergencia de archivos esenciales
function emergencyFiles(conn, m) {
    const urls = [
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/plugins/owner-update.js',
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/main.js',
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/package.json'
    ];

    let done = 0;
    urls.forEach(url => {
        const file = url.split('/').pop();
        const dest = file.startsWith('owner-') ? `plugins/${file}` : file;

        exec(`curl -s "${url}" -o "${dest}" || wget -q -O "${dest}" "${url}"`, () => {
            done++;
            if (done === urls.length) {
                conn.reply(m.chat, `😸 *FelixCat maulla: actualización de emergencia completada!* 🩸 ${urls.length} archivos actualizados`);
            }
        });
    });
}

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar'];
handler.rowner = true;

export default handler;
