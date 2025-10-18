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

  // Detectar destinatario: citado, mención o número
  if (m.quoted && m.quoted.sender) {
    otroJid = m.quoted.sender
    otroRaw = normalize(otroJid)
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    otroJid = m.mentionedJid[0]
    otroRaw = normalize(otroJid)
  } else if (args[0]) {
    const numMatch = args[0].match(/\d{5,15}/)
    if (!numMatch) return m.reply('⚠️ Formato inválido. Usa un número o mención.')
    otroRaw = normalize(numMatch[0])
    const domain = isGroup ? (yoJid.split('@')[1] || 's.whatsapp.net') : 's.whatsapp.net'
    otroJid = `${otroRaw}@${domain}`
  } else {
    return m.reply('❌ Debes escribir o mencionar a la persona cuya solicitud quieres rechazar.\n\nEjemplo:\n*.rechazar @123456789*')
  }

  // Buscar todas las solicitudes que existan **donde el destinatario es yo**
  const solicitudesPendientes = Object.entries(solicitudes)
    .filter(([key, arr]) => Array.isArray(arr))
    .map(([key, arr]) => ({ key, arr }))
    .find(item => item.arr.some(s => normalize(s.numero || s.jid) === yoRaw && normalize(s.jid || s.numero) === otroRaw))

  if (!solicitudesPendientes) {
    return m.reply('❌ No tienes una solicitud de esa persona.')
  }

  // Encontrar índice de la solicitud
  const solicitudIndex = solicitudesPendientes.arr.findIndex(s =>
    normalize(s.numero || s.jid) === otroRaw || normalize(s.jid || s.numero) === otroRaw
  )

  if (solicitudIndex === -1) {
    return m.reply('❌ No tienes una solicitud de esa persona.')
  }

  // Eliminar la solicitud
  solicitudesPendientes.arr.splice(solicitudIndex, 1)
  if (solicitudesPendientes.arr.length === 0) {
    delete solicitudes[solicitudesPendientes.key]
  } else {
    solicitudes[solicitudesPendientes.key] = solicitudesPendientes.arr
  }

  // Guardar cambios
  try {
    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))
  } catch (e) {
    console.error('Error guardando solicitudes.json', e)
    return m.reply('⚠️ Ocurrió un error al actualizar la base de solicitudes.')
  }

  // Mensaje picante e irónico
  const mensaje = `😂💔 @${otroRaw} quedaste re friendzoneado por @${yoRaw} 💔😂`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [yoJid, otroJid],
    quoted: m.quoted ? m.quoted : undefined
  })
}

handler.help = ['rechazar @usuario']
handler.tags = ['pareja']
handler.command = /^rechazar$/i

export default handler
