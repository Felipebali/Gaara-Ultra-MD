const handler = async (m, { conn, text }) => {
const emoji = '⚠️';
const done = '✅';
let user = '';

// Detectar usuario por número o mensaje citado  
const numberMatches = text?.match(/\d+/g);  
if (numberMatches) {  
    const number = numberMatches.join('');  
    user = number + '@s.whatsapp.net';  
} else if (m.quoted && m.quoted.sender) {  
    user = m.quoted.sender;  
} else {  
    return conn.sendMessage(m.chat, { text: `${emoji} Formato de usuario no reconocido.` });  
}  

const userJid = user.toLowerCase();  

// Verificar que el usuario exista en la base de datos  
if (!global.db.data.users[userJid]) {  
    return conn.sendMessage(m.chat, { text: `${emoji} El usuario no se encuentra en la base de datos.` });  
}  

// Eliminar todos los datos del usuario  
delete global.db.data.users[userJid];  

// Eliminar todas las advertencias del usuario en todos los chats  
Object.values(global.db.data.chats).forEach(chat => {  
    if (chat.warns && chat.warns[userJid]) {  
        delete chat.warns[userJid];  
    }  
});  

// Guardar cambios en la base de datos  
if (global.db.write) await global.db.write();  

// Mensaje de éxito limpio  
conn.sendMessage(m.chat, { text: `${done} Éxito. Todos los datos y advertencias del usuario fueron eliminados de la base de datos.` });

};

handler.tags = ['owner'];
handler.command = ['r','deletedatauser','resetuser','borrardatos'];
handler.owner = true; // SOLO owner

export default handler;
