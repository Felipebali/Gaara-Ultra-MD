let handler = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return m.reply('🚫 Este comando solo funciona en grupos.');
  
  // Solo owners pueden usarlo
  const owners = global.owner.map(o => o[0]);
  if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

  const participantes = groupMetadata.participants;

  let mensajeFinal = '╔══════════════════╗\n║      🐾 FelixCat-Bot 🐾     ║\n╠══════════════════╣\n';

  participantes.forEach((p, i) => {
    const username = '@' + p.id.split('@')[0]; // mención real
    const estado = p.admin === 'superadmin' ? '👑 Superadmin' :
                   p.admin === 'admin' ? '🛡️ Admin' : '👤 Miembro';

    mensajeFinal += `┏━━━━━━━━━━━━━━━🐾
┃ 🌟 Participante ${i + 1}
┃ 🙍‍♂️ Usuario: ${username}
┃ 🔑 LID: ${p.id}@lid
┃ 🏷️ Estado: ${estado}
┗━━━━━━━━━━━━━━━🐾
┃
`;
  });

  mensajeFinal += '╚══════════════════╝';

  // Menciones reales de todos los participantes
  const mentions = participantes.map(p => p.id);

  await conn.sendMessage(m.chat, { text: mensajeFinal, mentions });
}

handler.help = ['lids'];
handler.tags = ['group'];
handler.command = ['lids'];
handler.owner = true;
handler.group = true;

export default handler;
