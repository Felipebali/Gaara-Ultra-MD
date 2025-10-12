// ✅ Avisos de cambios en grupo - Comando .reconocer
// Compatible con Gaara-Ultra-MD + handler.before

global.db.data.chats = global.db.data.chats || {};
global.groupData = global.groupData || {};

let handler = async (m, { conn, isAdmin, isGroup }) => {
  if (!isGroup) return m.reply('❌ Este comando solo funciona en *grupos*.');
  if (!isAdmin) return m.reply('❌ Solo *administradores* pueden usar este comando.');

  let chat = global.db.data.chats[m.chat];
  chat.reconocer = !chat.reconocer;

  return m.reply(chat.reconocer 
    ? '✅ *Reconocer ACTIVADO*\nAvisaré cuando cambien el *nombre o la descripción* del grupo.' 
    : '❌ *Reconocer DESACTIVADO*');
};

handler.help = ['reconocer'];
handler.tags = ['group'];
handler.command = /^reconocer$/i;
handler.group = true;
export default handler;

// ====== Detector automático ======
handler.before = async function (m, { conn, isGroup }) {
  if (!isGroup) return;
  const chat = global.db.data.chats[m.chat];
  if (!chat.reconocer) return;

  try {
    const meta = await conn.groupMetadata(m.chat);
    global.groupData[m.chat] = global.groupData[m.chat] || {
      name: meta.subject,
      desc: meta.desc || ''
    };

    // Detectar cambio de nombre
    if (meta.subject !== global.groupData[m.chat].name) {
      await conn.sendMessage(m.chat, { text: `🔧 El *nombre del grupo* fue cambiado.\n🆕 Nuevo nombre: *${meta.subject}*` });
      global.groupData[m.chat].name = meta.subject;
    }

    // Detectar cambio de descripción
    if ((meta.desc || '') !== global.groupData[m.chat].desc) {
      await conn.sendMessage(m.chat, { text: `📝 La *descripción del grupo* fue actualizada:\n${meta.desc || '_Sin descripción_'}` });
      global.groupData[m.chat].desc = meta.desc || '';
    }

  } catch (err) {
    console.log('Error en .reconocer =>', err);
  }
};
