// plugins/antitagall.js
import fs from 'fs';

const DATA_FILE = './antitagall.json';

function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}'); }
  catch { return {}; }
}
function saveData(data) {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }
  catch(e) { console.error(e); }
}

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
  if (!m.isGroup) return;

  const data = loadData();

  if (command === 'antitagall') {
    if (!(isAdmin || isOwner)) return conn.sendMessage(m.chat, { text: '❌ Solo admins o dueño pueden usar este comando.' }, { quoted: m });
    data[m.chat] = !data[m.chat];
    saveData(data);
    return conn.sendMessage(m.chat, { text: `✅ Antitagall ${data[m.chat] ? 'activado' : 'desactivado'} en este grupo.` }, { quoted: m });
  }

  if (!data[m.chat]) return;
  if (!m.text) return;
  if (m.key.fromMe) return;

  try {
    const metadata = await conn.groupMetadata(m.chat);
    const total = metadata.participants.length;

    // Si el mensaje menciona al 40% o más de los miembros, se considera tagall
    if (m.mentionedJid && m.mentionedJid.length / total >= 0.4) {
      await conn.sendMessage(m.chat, { text: `❌ @${m.sender.split('@')[0]}, no se permite hacer tagall.` , mentions: [m.sender]}, { quoted: m });
      await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat });
      return;
    }

    // Patrón secundario: detectar intentos de tagall en texto
    const texto = m.text.toLowerCase().replace(/\s+/g,'');
    const patrones = ['.tagall','invocar','@all','allparticipants','participants.map','sendmessage','for(constuserofgroup)'];
    if (patrones.some(p => texto.includes(p))) {
      await conn.sendMessage(m.chat, { text: `❌ @${m.sender.split('@')[0]}, no se permite enviar copias del tagall.`, mentions:[m.sender] }, { quoted: m });
      await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat });
      return;
    }

  } catch(e){ console.error('Error antitagall', e); }
};

handler.command = ['antitagall'];
handler.all = true;
export default handler;
