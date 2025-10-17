const handler = async (m, { conn, isAdmin }) => { const sender = m.sender.replace(/\D/g, '');

const groupInfo = await conn.groupMetadata(m.chat); const ownerGroup = groupInfo.owner.replace(/\D/g, ''); const botJid = conn.user.jid.replace(/\D/g, '');

const ownersBot = ['59898719147','59896026646'];

if (!isAdmin && !ownersBot.includes(sender) && sender !== ownerGroup) { return conn.reply(m.chat, '❌ Solo admins, dueño del grupo o dueños del bot pueden usar este comando.', m); }

const candidates = groupInfo.participants.filter(p => { const jidNorm = String(p.jid || '').replace(/\D/g, ''); if (jidNorm === botJid) return false; if (ownersBot.includes(jidNorm)) return false; if (jidNorm === ownerGroup) return false; if (p.admin) return false; return true; });

if (!candidates.length) return conn.reply(m.chat, '❌ No hay participantes válidos para expulsar.', m);

const idx = Math.floor(Math.random() * candidates.length); const participant = candidates[idx];

try { await conn.groupParticipantsUpdate(m.chat, [participant.jid], 'remove'); await conn.reply(m.chat, La ruleta giró y @${participant.jid.split('@')[0]} fue expulsado., m, { mentions: [participant.jid] }); } catch (err) { console.log('Error expulsando:', err); return conn.reply(m.chat, '❌ Ocurrió un error al intentar expulsar. Asegúrate de que el bot sea administrador.', m); } };

handler.help = ['ruletaban']; handler.tags = ['grupo']; handler.command = ['ruletaban']; handler.admin = true; handler.group = true; handler.register = true; handler.botAdmin = true;

module.exports = handler;

