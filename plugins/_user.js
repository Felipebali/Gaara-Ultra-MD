let handler = async (m, { conn }) => {
    // Solo owners
    const owners = global.owner.map(o => o[0]);
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

    // Verificar si hay mensaje citado
    let target;
    if (m.quoted) {
        target = m.quoted.sender; // quien envió el mensaje citado
    } else if (m.text) {
        // Si escriben un número directo
        let number = m.text.split(' ')[1]; // .user 5989xxxxxx
        if (!number) return conn.sendMessage(m.chat, { text: '❌ Cita un mensaje o escribe el número para obtener el LID.' });
        target = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    } else {
        target = m.sender; // si no hay cita ni número, devuelve el LID de quien escribió
    }

    // Mostrar el LID/JID
    await conn.sendMessage(m.chat, { text: `🔹 LID/JID de la persona: ${target}` });
};

handler.help = ['user'];
handler.tags = ['owner'];
handler.command = ['user'];
handler.owner = true; // solo owners
export default handler;
