import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🎋 Por favor, proporciona el nombre de una canción o artista.\nEjemplo: ${usedPrefix}spotify <canción>`, m)

  try {
    // Buscamos en la API principal
    let searchUrl = `https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`
    let searchRes = await axios.get(searchUrl, { timeout: 15000 })
    let searchData = searchRes.data

    if (!searchData.status || !searchData.data || searchData.data.length === 0) {
      throw new Error('No se encontró resultado.')
    }

    let data = searchData.data[0]
    let { title, artist, album, duration, popularity, publish, url: spotifyUrl, image } = data

    let caption = `「✦」Descargando *<${title}>*\n\n` +
      `> ꕥ Autor » *${artist}*\n` +
      (album ? `> ❑ Álbum » *${album}*\n` : '') +
      (duration ? `> ⴵ Duración » *${duration}*\n` : '') +
      (popularity ? `> ✰ Popularidad » *${popularity}*\n` : '') +
      (publish ? `> ☁︎ Publicado » *${publish}*\n` : '') +
      (spotifyUrl ? `> 🜸 Enlace » ${spotifyUrl}` : '')

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: '🕸️ ✧ Spotify • Music ✧ 🌿',
          body: artist,
          thumbnailUrl: image,
          sourceUrl: spotifyUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // Intentamos descargar desde varias APIs
    let downloadUrl = null
    let serverUsed = 'Desconocido'

    const tryFetchJson = async (url) => {
      try {
        let res = await fetch(url, { timeout: 20000 })
        let text = await res.text()
        try {
          return JSON.parse(text)
        } catch {
          return null
        }
      } catch {
        return null
      }
    }

    // 1. Nekolabs
    try {
      let apiV1 = `https://api.nekolabs.my.id/downloader/spotify/v1?url=${encodeURIComponent(spotifyUrl)}`
      let dl1 = await axios.get(apiV1, { timeout: 20000 })
      if (dl1?.data?.result?.downloadUrl) {
        downloadUrl = dl1.data.result.downloadUrl
        serverUsed = 'Nekolabs'
      }
    } catch { }

    // 2. Sylphy
    if (!downloadUrl) {
      try {
        let apiSylphy = `https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=sylphy-c519`
        let dlSylphy = await axios.get(apiSylphy, { timeout: 20000 })
        if (dlSylphy?.data?.status && dlSylphy?.data?.data?.dl_url) {
          downloadUrl = dlSylphy.data.data.dl_url
          serverUsed = 'Sylphy'
        }
      } catch { }
    }

    // 3. Neoxr
    if (!downloadUrl) {
      let apiV3 = `https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=russellxz`
      let json3 = await tryFetchJson(apiV3)
      if (json3?.status && json3?.data?.url) {
        downloadUrl = json3.data.url
        serverUsed = 'Neoxr'
      }
    }

    // Enviar audio si encontramos un link válido
    if (downloadUrl) {
      let audio = await fetch(downloadUrl)
      let buffer = await audio.buffer()

      await conn.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: "🍏 Spotify • Music 🌿",
            body: "Disfruta tu música favorita 🎋",
            thumbnailUrl: image,
            sourceUrl: spotifyUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })

      await conn.reply(m.chat, `> ✎ Descarga completa.\n> ✿ Servidor usado: *${serverUsed}*`, m)
    } else {
      await conn.reply(m.chat, `❌ No se encontró un link de descarga válido para esta canción.`, m)
    }

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ Error al buscar o descargar la canción.`, m)
  }
}

handler.help = ["spotify"]
handler.tags = ["download"]
handler.command = ["spotify","splay"]
handler.group = true

export default handler
