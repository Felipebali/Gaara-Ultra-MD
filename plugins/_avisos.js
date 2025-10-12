let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❌ Este comando solo funciona en grupos." });

    if (!isBotAdmin) return conn.sendMessage(m.chat, { text: "⚠️ Necesito ser administrador para reconocer el grupo." });

    let groupMetadata = await conn.groupMetadata(m.chat);
    let groupName = groupMetadata.subject || "Grupo sin nombre";
    let members = groupMetadata.participants.length;

    return conn.sendMessage(m.chat, {
        text: `✅ Grupo reconocido correctamente\n\n📛 Nombre: *${groupName}*\n👥 Miembros: *${members}*\n🤖 Estado: *Registrado en la memoria del bot*`
    });
};

handler.command = /^reconocer$/i;
handler.group = true;
export default handler;
