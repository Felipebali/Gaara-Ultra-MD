// plugins/_ml.js
import axios from 'axios';

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '⚠️ Debes poner lo que quieres buscar. Ej: .ml notebook', m);

  try {
    let url = `https://api.mercadolibre.com/sites/MLU/search?q=${encodeURIComponent(text)}&limit=3`;
    let { data } = await axios.get(url);

    if (!data.results || data.results.length === 0) {
      return conn.reply(m.chat, '⚠️ No se encontraron productos.', m);
    }

    let mensaje = '*🛒 Resultados de Mercado Libre:*\n\n';
    for (let item of data.results) {
      mensaje += `*${item.title}*\n💰 Precio: ${item.price} ${item.currency_id}\n🔗 [Link al producto](${item.permalink})\n🖼️ Imagen: ${item.thumbnail}\n\n`;
    }

    await conn.sendMessage(m.chat, { text: mensaje });

  } catch (e) {
    console.log('Error plugin ML:', e);
    conn.reply(m.chat, '[ALERTA] ❌ Ocurrió un error buscando en Mercado Libre.', m);
  }
};

handler.help = ['ml <producto>'];
handler.tags = ['internet'];
handler.command = ['ml'];

export default handler;
