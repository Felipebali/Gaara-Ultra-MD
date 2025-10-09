import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';

let handler = async (m, { conn }) => {
    conn.reply(m.chat, `🐾 *FelixCat invoca su hechizo de actualización...*\n🩸 Descargando archivos desde GitHub...`);

    try {
        const zipUrl = 'https://github.com/Felipebali/Gaara-Ultra-MD/archive/refs/heads/main.zip';
        const res = await fetch(zipUrl);
        const buffer = await res.arrayBuffer();

        const zip = new AdmZip(Buffer.from(buffer));
        zip.extractAllTo(process.cwd(), true);

        conn.reply(m.chat, `😸 *FelixCat maulla: archivos actualizados con éxito!* 🩸`);
    } catch (e) {
        conn.reply(m.chat, `☠️ Error en actualización: ${e.message}\nFelixCat usa magia de emergencia...`);
        emergencyFiles(conn, m);
    }
};

function emergencyFiles(conn, m) {
    const urls = [
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/plugins/owner-update.js',
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/main.js',
        'https://raw.githubusercontent.com/Felipebali/Gaara-Ultra-MD/main/package.json'
    ];

    if (!fs.existsSync('plugins')) fs.mkdirSync('plugins');

    urls.forEach(async (url) => {
        const file = url.split('/').pop();
        const dest = file.startsWith('owner-') ? `plugins/${file}` : file;

        const res = await fetch(url);
        const data = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, data);
    });

    conn.reply(m.chat, `😸 *FelixCat maulla: actualización de emergencia completada!* 🩸`);
}

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar'];
handler.rowner = true;

export default handler;
