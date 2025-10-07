// plugins/promote.js
export default {
  name: 'promote',
  description: 'Promueve a un usuario a administrador',
  group: true,
  admin: true,
  botAdmin: true,
  command: ['p'], // ahora se activa con .p
  all: async function (m, { conn }) {
    if (!m.mentionedJid?.[0] && !m.quoted) {
      let texto = `⚠️ Menciona o responde al mensaje del usuario que deseas promover a administrador.`
      return conn.sendMessage(m.chat, { text: texto, mentions: [] });
    }

    let user = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted.sender
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
      await conn.sendMessage(m.chat, { text: `✅ El usuario fue promovido a administrador.`, mentions: [user] });
    } catch (e) {
      console.error(e)
      await conn.sendMessage(m.chat, { text: `❌ No se pudo promover al usuario.`, mentions: [user] });
    }
  }
}
