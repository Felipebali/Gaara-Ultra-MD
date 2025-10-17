const handler = async (m, { conn, isAdmin }) => { const emoji = '🎲'; const sender = m.sender.replace(/\D/g, '');

const groupInfo = await conn.groupMetadata(m.chat); const ownerGroup = groupInfo.owner.replace(/\D/g, ''); const botJid = conn.user.jid.replace(/\D/g, '');

// Lista de números owners/protegidos const ownersBot = ['59898719147','59896026646']; // dueños del bot

// ---------- PERMISO ---------- if (!isAdmin && !ownersBot.includes(sender) && sender !== ownerGroup) { return conn.reply(m.chat, '❌ Solo admins, dueño del grupo o dueños del bot pueden usar este comando.', m); }

// ---------- CANDIDATOS A EXPULSIÓN ---------- const candidates = groupInfo.participants.filter(p => { const jidNorm = String(p.jid || '').replace(/\D/g, ''); if (jidNorm === botJid) return false; if (ownersBot.includes(jidNorm)) return false; if (jidNorm === ownerGroup) return false; if (p.admin) return false; return true; });

if (!candidates.length) return conn.reply(m.chat, '❌ No hay participantes válidos para expulsar.', m);

// Elegir 1 participante al azar const idx = Math.floor(Math.random() * candidates.length); const participant = candidates[idx];

// ---------- EXPULSAR ---------- try { await conn.groupParticipantsUpdate(m.chat, [participant.jid], 'remove'); await m.react(emoji).catch(() => {}); await conn.reply(m.chat, 💥 La ruleta giró y @${participant.jid.split('@')[0]} fue expulsado., m, { mentions: [participant.jid] }); try { await conn.deleteMessage(m.chat, m.key); } catch {} } catch (err) { console.log('Error expulsando:', err); return conn.reply(m.chat, '❌ Ocurrió un error al intentar expulsar. Asegúrate de que el bot sea administrador.', m); } };

handler.help = ['ruletaban']; handler.tags = ['grupo']; handler.command = ['ruletaban']; handler.admin = true;
handler.group = true; handler.register = true; handler.botAdmin = true;

export default handler;

 
