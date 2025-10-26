// plugins/_modoadmin-filter.js
let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return;

    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.modoadmin) return; // si no está activado, no bloquea nada

    // Ignorar mensajes sin texto
    if (!m.text) return;
    const body = m.text.trim();

    // Si el mensaje empieza con el prefijo del bot (.)
    if (body.startsWith('.')) {
        const command = body.slice(1).split(' ')[0].toLowerCase();

        // Excepciones: estos comandos sí pueden usarse aunque el modo admin esté activado
        const permitidos = ['modoadmin', 'menu']; // podés agregar más si querés

        if (permitidos.includes(command)) return;

        // Si no es admin ni owner → bloquea el comando
        if (!(isAdmin || isOwner)) {
            await conn.sendMessage(m.chat, { text: '🚫 El bot está en *Modo Admin*.\nSolo los administradores pueden usar comandos ahora.' });
            throw false; // Detiene la ejecución del resto de comandos
        }
    }
};

export default handler; 
