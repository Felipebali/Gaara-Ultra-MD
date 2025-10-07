// plugins/demote.js
export default {
  name: 'demote',
  description: 'Degrada a un administrador a usuario normal',
  group: true,
  admin: true,
  botAdmin: true,
  command: ['d'], // ahora se activa con .d
  all: async function (m, { conn }) {
    if (!m.mentionedJid?.[0] && !m.quoted) {
      let texto = `⚠️ Menciona o responde al mensaje del administrador que deseas degradar.`
      return conn.sendMessage(m.chat, { text: texto, mentions: [] });
    }

    let user = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted.sender
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
      await conn.sendMessage(m.chat, { text: `✅ El administrador fue degradado a usuario normal.`, mentions: [user] });
    } catch (e) {
      console.error(e)
      await conn.sendMessage(m.chat, { text: `❌ No se pudo degradar al administrador.`, mentions: [user] });
    }
  }
}
