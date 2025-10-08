let handler = async (m, { conn, isROwner, isOwner }) => {
  if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.');
  if (!(isROwner || isOwner)) return m.reply('❌ Solo los dueños del bot pueden usar este comando.');

  try {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const admins = groupMetadata.participants.filter(p => p.admin);
    let listAdmins = admins.map((a, i) => `• ${i+1}. @${a.id.split('@')[0]} (${a.admin})`).join('\n');

    m.reply(`📋 *Lista de administradores:*\n\n${listAdmins}`);
  } catch (e) {
    m.reply('⚠️ Error al obtener la lista de admins.');
    console.error(e);
  }
};

handler.help = ['longadmin'];
handler.tags = ['admin'];
handler.command = ['longadmin'];
handler.group = true;
handler.rowner = true; // <-- solo owner
export default handler;
