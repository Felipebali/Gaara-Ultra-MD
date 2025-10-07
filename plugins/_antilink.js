// Si hay link de grupo
if (m.text.match(groupLinkRegex)) {
    try {
        // Obtener lista de admins del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);
        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

        // Si el remitente NO es admin, eliminar mensaje y expulsar
        if (!admins.includes(m.sender)) {
            await conn.sendMessage(m.chat, { delete: m.key }); // borrar mensaje
            await conn.reply(m.chat, `> ⚠️ @${m.sender.split`@`[0]} fue eliminado por Anti-Link`, null, { mentions: [m.sender] });
            console.log(`Usuario ${m.sender} eliminado del grupo ${m.chat} por Anti-Link`);
        } else {
            // Si es admin, solo borramos mensaje y avisamos que las reglas aplican para todos
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.reply(
              m.chat,
              `⚠️ Administrador @${m.sender.split`@`[0]} envió un link de grupo.\n🔹 Recuerda que las reglas son iguales para todos y el mensaje fue eliminado.`,
              null,
              { mentions: [m.sender] }
            );
            console.log(`Mensaje de admin ${m.sender} eliminado por Anti-Link, reglas iguales para todos`);
        }
    } catch (error) {
        console.error("Error procesando Anti-Link:", error);
    }
}
