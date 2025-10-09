// plugins/grupo-reportar.js
let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply('⚠️ Debes responder al mensaje que quieres reportar.');

    const owners = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net']; // dueños oficiales

    for (let owner of owners) {
        await conn.sendMessage(owner, {
            text: `🚨 *Nuevo Reporte Recibido*\n\n📌 *Desde el grupo:* ${m.chat}\n🗣 *Usuario:* ${m.sender}\n\n📎 *Mensaje reportado:*`,
        });

        // reenviar manualmente el contenido del mensaje
        await conn.sendMessage(owner, {
            forward: m.quoted
        });
    }

    await conn.sendMessage(m.chat, {
        text: `✅ El mensaje fue reportado correctamente.`,
    }, { quoted: m.quoted });
};

handler.command = ['reportar', 'report'];
handler.group = true;
export default handler;
