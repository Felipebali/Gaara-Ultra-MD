// plugins/menu.js
// Créditos: BrayanOFC / Modificado por xzzys26 / Adaptado para FelixCat-Bot

const botname = global.botname || '🌪️ FelixCat-Bot 🌪️'
const creador = 'Felipe' 
const versionBot = '10.5.0'

let tags = {
  'serbot': '🤖 SUB-BOTS',
  'info': '🌀 INFOS',
  'main': '📜 MENÚ',
  'nable': '⚡ MODO AVANZADO',
  'cmd': '📝 COMANDOS',
  'advanced': '🌟 FUNCIONES AVANZADAS',
  'game': '🎮 JUEGOS',
  'group': '📚 GRUPOS',
  'downloader': '📥 DESCARGAS',
  'sticker': '🖼️ STICKER',
  'audio': '🔊 AUDIO',
  'search': '🔎 BÚSQUEDA',
  'tools': '🧰 HERRAMIENTAS',
  'fun': '🎉 DIVERSIÓN',
  'gacha': '🧧 ANIME',
  'nsfw': '🔞 NSFW',
  'premium': '💎 PREMIUM'
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Plugins activos
    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : []),
        tags: Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : []),
        limit: plugin.limit,
        premium: plugin.premium
      }))

    // Saludo corto
    let saludo = getSaludoCorto()

    // Bloque inicial
    let menuText = `
╭━━━〔 ⚡️ *MENÚ ${botname}* ⚡️ 〕━━━⬣
┃ ❒ *Creador*: ${creador}
┃ ❒ *Versión*: ${versionBot}
┃ ❒ *Saludo*: ${saludo}
╰━━━━━━━━━━━━━━━━━━━━⬣
`

    // Recorremos categorías
    for (let tag in tags) {
      let comandos = help.filter(menu => menu.tags.includes(tag))
      if (!comandos.length) continue

      menuText += `
╭━━━〔 ${tags[tag]} 〕━━━⬣
${comandos.map(menu => menu.help.map(help =>
  `┃ ➟ ${_p}${help}${menu.limit ? ' 🟡' : ''}${menu.premium ? ' 🔒' : ''}`
).join('\n')).join('\n')}
╰━━━━━━━━━━━━━━━━━━━━⬣
`
    }

    menuText += `\n> 👑 Powered by FelixCat 🥷🏽`

    // Enviar mensaje solo con texto, sin botones ni medios
    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m })

  } catch (e) {
    conn.reply(m.chat, `✖️ Error al mostrar el menú.\n\n${e}`, m)
    console.error(e)
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'allmenu', 'menú']

export default handler

// Saludo corto sin depender de registro
function getSaludoCorto() {
  let hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "🌅 Buenos días"
  if (hour >= 12 && hour < 18) return "☀️ Buenas tardes"
  return "🌙 Buenas noches"
}
