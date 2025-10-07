let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

  // usuario reportado (respuesta o mención)
  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0]);
  if (!target) return conn.reply(m.chat, '⚠️ Debes responder o mencionar al usuario que deseas reportar.\n\nEjemplo:\n.report @usuario insultos\nO responde a su mensaje con:\n.report spam', m);

  // motivo
  const reason = args.length ? args.join(' ') : 'Sin motivo especificado';

  // obtener admins del grupo
  let metadata = {};
  try { metadata = await conn.groupMetadata(m.chat); } 
  catch (e) { metadata = { participants: [] }; }

  const admins = (metadata.participants || []).filter(p => p.admin).map(p => p.id);

  if (admins.length === 0) return conn.reply(m.chat, '⚠️ No se encontraron administradores en este grupo.', m);

  // datos del reporte
  const reporter = m.sender;
  const targetName = conn.getName(target) || target.split('@')[0];
  const reporterName = conn.getName(reporter) || reporter.split('@')[0];

  const text = `🚨 *REPORTE EN EL GRUPO*\n\n👤 *Reportado:* @${target.split('@')[0]} (${targetName})\n🙋‍♂️ *Reportado por:* @${reporter.split('@')[0]} (${reporterName})\n📝 *Motivo:* ${reason}\n\n⚠️ *Atención administradores:* por favor revisen este caso.`;

  const mentions = [target, reporter, ...admins];

  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m });
};

handler.help = ['report', 'reportar'];
handler.tags = ['group'];
handler.command = ['report', 'reportar'];
handler.group = true;
handler.register = true;

export default handler;
