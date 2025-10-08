// plugins/longadmin.js
let handler = async (m, { conn, isROwner, isOwner }) => {
  if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.');
  if (!(isROwner || isOwner)) return m.reply('❌ Solo los dueños del bot pueden usar este comando.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const admins = groupMetadata.participants.filter(p => p.admin);

  const mentionedJids = admins.map(a => a.id);

  if (m.text.toLowerCase().includes('log')) {
    // Mostrar log de quién promovió a quién
    let adminLog = global.db.data.adminLog?.[m.chat] || [];
    let text = admins.map((a, i) => {
      let log = adminLog.find(l => l.promoted === a.id);
      let promotedBy = log ? ` promovido por @${log.by.split('@')[0]}` : '';
      let emojiAdmin = a.admin === 'superadmin' ? '👑' : '🛡️';
      return `• ${i + 1}. ${emojiAdmin} @${a.id.split('@')[0]}${promotedBy}`;
    }).join('\n');

    await conn.sendMessage(
      m.chat,
      { text: `📋 *Admins del grupo con log:*\n\n${text}`, contextInfo: { mentionedJid: mentionedJids } },
      { quoted: m }
    );

  } else {
    // Solo mostrar lista de admins
    let listAdmins = admins.map((a, i) => {
      let emojiAdmin = a.admin === 'superadmin' ? '👑' : '🛡️';
      return `• ${i + 1}. ${emojiAdmin} @${a.id.split('@')[0]} (${a.admin})`;
    }).join('\n');

    await conn.sendMessage(
      m.chat,
      { text: `📋 *Lista de administradores:*\n\n${listAdmins}`, contextInfo: { mentionedJid: mentionedJids } },
      { quoted: m }
    );
  }
};

// Evento para registrar promociones
export async function groupParticipantsUpdate(update, conn) {
  const { id: groupId, participants, action, actor } = update;
  if (action === 'promote') {
    participants.forEach(userId => {
      if (!global.db.data.adminLog) global.db.data.adminLog = {};
      if (!global.db.data.adminLog[groupId]) global.db.data.adminLog[groupId] = [];
      global.db.data.adminLog[groupId].push({
        promoted: userId,
        by: actor || 'Desconocido',
        time: Date.now()
      });
    });
  }
}

handler.help = ['longadmin', 'longadmin log'];
handler.tags = ['admin'];
handler.command = ['longadmin', 'longadmin2'];
handler.group = true;
handler.rowner = true; // Solo owner puede usar

export default handler;
