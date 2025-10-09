import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';

let handler = async (m, { conn }) => {
    conn.reply(m.chat, `🐾 *FelixCat invoca su hechizo de actualización...*\n🩸 Descargando archivos desde GitHub...`);

    try {
        const zipUrl = 'https://github.com/Felipebali/Gaara-Ultra-MD/archive/refs/heads/main.zip';
        const res = await fetch(zipUrl);

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const buffer = Buffer.from(await res.arrayBuffer());
        const zip = new AdmZip(buffer);

        zip.extractAllTo(process.cwd(), true);

        conn.reply(m.chat, `😸 *FelixCat maulla: archivos actualizados con éxito!* 🩸`);
    } catch (e) {
        conn.reply(m.chat, `⚠️ GitHub o ZIP falló: ${e.message}\nFelixCat activa magia de emergencia...`);
        await emergencyFiles(conn, m);
    }
};

async function emergencyFiles(conn, m) {
    const urls = [
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/plugins/owner-update.js',
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/main.js',
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/package.json'
    ];

    if (!fs.existsSync('plugins')) fs.mkdirSync('plugins');

    for (let url of urls) {
        try {
            const fileName = url.split('/').pop();
            const dest = fileName.startsWith('owner-') ? `plugins/${fileName}` : fileName;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const data = Buffer.from(await res.arrayBuffer());

            fs.writeFileSync(dest, data);
        } catch (err) {
            console.error(`Error descargando ${url}: ${err.message}`);
        }
    }

    conn.reply(m.chat, `😸 *FelixCat maulla: actualización de emergencia completada!* 🩸`);
}

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar'];
handler.rowner = true;

export default handler;
