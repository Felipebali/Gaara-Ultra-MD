// plugins/antitagall.js
import fs from 'fs';

const DATA_FILE = './antitagall.json';
const LINK_UNICO_TAGALL = 'https://miunicolink.local/tagall-FelixCat'; // mismo link que agregamos en tagall

// Funciones para leer y guardar el estado por grupo
function loadData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}');
    } catch (e) {
        return {};
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error guardando antitagall.json', e);
    }
}

// Extraer texto de varios tipos de mensajes
function extractTextFromMessage(m) {
    try {
        if (!m) return '';
        const msg = m.message || {};
        if (msg.conversation) return msg.conversation;
        if (msg.extendedTextMessage && msg.extendedTextMessage.text) return msg.extendedTextMessage.text;
        if (msg.imageMessage && msg.imageMessage.caption) return msg.imageMessage.caption;
        if (msg.videoMessage && msg.videoMessage.caption) return msg.videoMessage.caption;
        return '';
    } catch {
        return '';
    }
}

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
    if (!m.isGroup) return;

    const data = loadData();

    // Activar/desactivar antitagall
    if (command === 'antitagall') {
        if (!(isAdmin || isOwner)) return conn.sendMessage(m.chat, { text: '❌ Solo admins o dueño pueden usar este comando.' }, { quoted: m });
        data[m.chat] = !data[m.chat];
        saveData(data);
        return conn.sendMessage(m.chat, { text: `✅ Antitagall ${data[m.chat] ? 'activado' : 'desactivado'} en este grupo.` }, { quoted: m });
    }

    if (!data[m.chat]) return; // si está desactivado
    if (!m.text) return;
    if (m.key.fromMe) return; // ignorar mensajes del propio bot

    const texto = extractTextFromMessage(m).toLowerCase();

    // Detectar link único en mensaje
    if (texto.includes(LINK_UNICO_TAGALL.toLowerCase())) {
        try { await conn.sendMessage(m.chat, { text: '❌ No se permite enviar copias del .tagall del bot.' }, { quoted: m }); } catch {}
        try { await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat }); } catch (e) { console.error(e); }
        return;
    }

    // Patrón secundario: detección por fragmentos típicos del tagall
    const patrones = [
        '.tagall',
        'for(letmemofparticipants)',
        'participants.map',
        'conn.sendmessage(',
        'awaitconn.sendmessage(',
        'mentions:',
        'mentions=',
        'participants.foreach',
        'for(constuserofgroup)'
    ];
    const textoSinEspacios = texto.replace(/\s+/g, '');
    const encontrado = patrones.some(p => textoSinEspacios.includes(p));
    if (encontrado) {
        try { await conn.sendMessage(m.chat, { text: '❌ No se permite enviar copias del .tagall del bot.' }, { quoted: m }); } catch {}
        try { await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat }); } catch (e) { console.error(e); }
        return;
    }

    // Opcional: detectar menciones masivas
    if (m.mentionedJid && Array.isArray(m.mentionedJid)) {
        try {
            const metadata = await conn.groupMetadata(m.chat);
            const total = metadata.participants.length || 1;
            if (m.mentionedJid.length / total >= 0.4) {
                await conn.sendMessage(m.chat, { text: '❌ No se permite hacer menciones masivas.' }, { quoted: m });
                await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat });
            }
        } catch {}
    }
};

handler.command = ['antitagall'];
handler.all = true;
export default handler;
