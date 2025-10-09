// plugins/_ml.js
import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, args }) => {
  if (!args || args.length === 0) 
    return conn.sendMessage(m.chat, { text: '⚠️ Escribí lo que querés buscar. Ejemplo: *.ml iPhone 14*' });

  const query = args.join(' ');
  try {
    const url = `https://listado.mercadolibre.com.uy/${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const items = [];
    $('li.ui-search-layout__item').slice(0, 3).each((i, el) => {
      const title = $(el).find('h2.ui-search-item__title').text();
      const link = $(el).find('a.ui-search-link').attr('href');
      const price = $(el).find('span.price-tag-fraction').first().text();
      if (title && link) items.push({ title, link, price });
    });

    if (!items.length) return conn.sendMessage(m.chat, { text: '❌ No se encontraron productos.' });

    let message = `🛒 *Resultados de Mercado Libre para:* *${query}*\n\n`;
    for (let prod of items) {
      message += `🔹 *${prod.title}*\n💰 Precio: ${prod.price}\n🔗 [Ver en Mercado Libre](${prod.link})\n\n`;
    }

    await conn.sendMessage(m.chat, { text: message, linksPreview: true });
  } catch (e) {
    console.log(e);
    conn.sendMessage(m.chat, { text: '[ALERTA] ❌ Ocurrió un error buscando en Mercado Libre.' });
  }
};

handler.command = ['ml'];
handler.help = ['ml <producto>'];
handler.tags = ['internet'];
handler.group = false;
handler.register = true;

export default handler;
