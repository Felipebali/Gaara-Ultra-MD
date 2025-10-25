// plugins/dar-todos-admin.js
let handler = async (m, { conn, isOwner }) => {
  if (!m.isGroup) 
    return await conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: m });
  
  // Solo el/los dueños pueden usar este comando
  if (!isOwner)
    return await conn.sendMessage(m.chat, { text: '❌ Solo el dueño puede usar este comando.' }, { quoted: m });

  try {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants || [];
    const members = participants.map(p => p.id);
    const admins = participants.filter(p => p.admin).map(p => p.id);

    const toPromote = members.filter(id => !admins.includes(id));

    if (toPromote.length === 0) {
      return await conn.sendMessage(m.chat, { text: '⚠️ Todos ya son administradores.' }, { quoted: m });
    }

    // Promociona a todos los que no son admin
    for (let id of toPromote) {
      await conn.groupParticipantsUpdate(m.chat, [id], 'promote');
      await new Promise(res => setTimeout(res, 1000)); // Espera 1 seg para evitar bloqueo
    }

    await conn.sendMessage(m.chat, { text: `✅ Se ha dado admin a *${toPromote.length}* miembros.` }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
  }
};

handler.help = ['dar'];
handler.tags = ['owner'];
handler.command = /^dar$/i;
handler.group = true;
handler.rowner = true; // 🔹 solo el dueño real del bot puede usarlo

module.exports = handler;
