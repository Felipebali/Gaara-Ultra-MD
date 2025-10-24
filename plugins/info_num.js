// 📂 plugins/infonum.js
const countryCodes = {
    "1": "Estados Unidos / Canadá",
    "44": "Reino Unido",
    "34": "España",
    "598": "Uruguay",
    "54": "Argentina",
    "51": "Perú",
    "52": "México",
    "55": "Brasil",
    // Agrega más códigos según necesites
}

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('❌ Debes ingresar un número con prefijo internacional, ejemplo: +59898719147')
    
    // Quitamos cualquier carácter que no sea número
    let numero = text.replace(/\D/g, '');
    
    // Buscamos el país por prefijo (del más largo al más corto)
    let pais = "Desconocido";
    for (let i = 1; i <= 3; i++) {
        let prefijo = numero.substring(0, i);
        if (countryCodes[prefijo]) {
            pais = countryCodes[prefijo];
            break;
        }
    }
    
    m.reply(`📞 Número: +${numero}\n🌍 País: ${pais}`);
}

handler.command = /^infonum$/i;
handler.limit = true;
export default handler;
