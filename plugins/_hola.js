let handler = async (m, { conn, isAdmin, isBotAdmin, mentionedJid, groupMetadata }) => {
    try {
        let target;

        // Si hay mención, toma el primer mencionado
        if (mentionedJid && mentionedJid.length > 0) {
            target = mentionedJid[0];
        } else {
            target = m.sender; // sino, el que escribió
        }

        // Número puro
        let numero = target.split("@")[0];

        // Verificar si el usuario es admin (solo si estamos en grupo)
        let esAdmin = false;
        if (groupMetadata) {
            let participant = groupMetadata.participants.find(p => p.id === target);
            if (participant) esAdmin = participant.admin !== null; // null = no es admin
        }

        // Construir mensaje divertido
        let mensaje = `😼 ¡Número detectado! 📲\n\n`;
        mensaje += `Usuario: ${target === m.sender ? '¡Tú! 😏' : `@${numero}`}\n`;
        mensaje += `Número: +${numero}\n`;
        mensaje += `Rol: ${esAdmin ? '👑 Admin del grupo' : '🙈 Miembro normal'}\n\n`;
        mensaje += `💬 Chatea directo: https://wa.me/${numero}`;

        // Enviar mensaje con mención si es alguien más
        await conn.sendMessage(m.chat, {
            text: mensaje,
            mentions: target === m.sender ? [] : [target]
        });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '❌ Oops, algo salió mal 😿' });
    }
};

// Comandos
handler.command = ['getnumber','mynumber','number','numero'];
export default handler;
