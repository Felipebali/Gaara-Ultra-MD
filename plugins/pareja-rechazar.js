import fs from 'fs'
import path from 'path'

const normalize = s => (s || '').toString().replace(/\D/g, '') // deja solo dígitos

const handler = async (m, { conn, args }) => {
  const solicitudesPath = path.join('./database', 'solicitudes.json')

  if (!fs.existsSync(solicitudesPath)) return m.reply('❌ No hay solicitudes registradas.')

  let solicitudes = {}
  try {
    solicitudes = JSON.parse(fs.readFileSync(solicitudesPath, 'utf8') || '{}')
  } catch (e) {
    console.error('Error parseando solicitudes.json', e)
    solicitudes = {}
  }

  const yoJid = m.sender
  const yoRaw = normalize(yoJid)
  const isGroup = m.isGroup || (m.chat && m.chat.endsWith && m.chat.endsWith('@g.us'))

  let otroJid, otroRaw

  // Si se está citando un mensaje, tomar sender del mensaje citado
  if (m.quoted && m.quoted.sender) {
    otroJid = m.quoted.sender
    otroRaw = normalize(otroJid)
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    // Mención directa
    otroJid = m.mentionedJid[0]
    otroRaw = normalize(otroJid)
  } else if (args[0]) {
    // Número en texto
    const numMatch = args[0].match(/\d{5,15}/)
    if (!numMatch) return m.reply('⚠️ Formato inválido. Usa un número o mención.')
    otroRaw = normalize(numMatch[0])

    // Construimos un JID tentativa sólo para la mención; la búsqueda se hará por número
    // Preferimos usar el dominio del chat (si es grupo) o s.whatsapp.net por defecto
    const domain = isGroup ? (yoJid.split('@')[1] || 's.whatsapp.net') : 's.whatsapp.net'
    otroJid = `${otroRaw}@${domain}`
  } else {
    return m.reply('❌ Debes escribir o mencionar a la persona cuya solicitud quieres rechazar.\n\nEjemplo:\n*.rechazar @123456789*')
  }

  // Determinar bajo qué clave están mis solicitudes (puede estar guardado con jid completo o con el número raw)
  const ownerKey = solicitudes[yoJid] ? yoJid : (solicitudes[yoRaw] ? yoRaw : (solicitudes[yoJid] ? yoJid : yoRaw))

  const misSolicitudes = solicitudes[ownerKey] || []
  if (!misSolicitudes || !Array.isArray(misSolicitudes) || misSolicitudes.length === 0) {
    return m.reply('❌ No tienes ninguna solicitud pendiente.')
  }

  // Buscar comparando únicamente el número normalizado
  const solicitudIndex = misSolicitudes.findIndex(s => {
    const sNumero = normalize(s.numero || s.jid || s.from || '')
    // si la solicitud almacena jid, también lo normalizamos
    return sNumero && sNumero === otroRaw
  })

  if (solicitudIndex === -1) {
    return m.reply('❌ No tienes una solicitud de esa persona.')
  }

  // Extraer la solicitud encontrada
  const solicitud = misSolicitudes[solicitudIndex]

  // Determinar JID real para mencionar en el mensaje final:
  // si la solicitud tiene un jid guardado, úsalo; si no, usamos la construcción tentativa
  const otroJidReal = solicitud.jid ? solicitud.jid : otroJid

  // Eliminar la solicitud rechazada
  const nuevas = misSolicitudes.filter((_, i) => i !== solicitudIndex)
  if (nuevas.length === 0) {
    delete solicitudes[ownerKey]
  } else {
    solicitudes[ownerKey] = nuevas
  }

  // Guardar archivo
  try {
    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))
  } catch (e) {
    console.error('Error guardando solicitudes.json', e)
    return m.reply('⚠️ Ocurrió un error al actualizar la base de solicitudes.')
  }

  // Mensaje con menciones reales
  const mensaje = `💔 *@${yoRaw} ha rechazado la solicitud de @${normalize(otroJidReal)}...* 💔

📜 *Poema del desamor* 📜
_"Te vi llegar con ojos brillantes,_
_y yo soñaba con instantes vibrantes._
_Pero el amor no siempre se logra alcanzar,_
_y a veces solo queda dejarlo pasar."_ 💔

😔 No te desanimes, el verdadero amor llega cuando menos lo esperas.`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [yoJid, otroJidReal],
    quoted: m.quoted ? m.quoted : undefined
  })
}

handler.help = ['rechazar @usuario']
handler.tags = ['pareja']
handler.command = /^rechazar$/i

export default handler
