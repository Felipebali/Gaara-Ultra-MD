let handler = async (m, { conn }) => {
    const owners = global.owner.map(o => o[0]);
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

    let target;

    // 1️⃣ Si hay mensaje citado
    if (m.quoted) {
        target = m.quoted.sender;
    } 
    // 2️⃣ Si escriben un número
    else if (m.text && m.text.split(' ')[1]) {
        let number = m.text.split(' ')[1];
        target = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    } 
    // 3️⃣ Si nada, aviso
    else {
        return conn.sendMessage(m.chat, { text: '❌ Cita un mensaje o escribe el número para obtener el LID.' });
    }

    await conn.sendMessage(m.chat, { text: `🔹 LID/JID de la persona: ${target}` });
};

handler.help = ['user'];
handler.tags = ['owner'];
handler.command = ['user'];
handler.owner = true;
export default handler;
