import fs from 'fs'
import path from 'path'
import P from 'pino'
import { makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Estado de sesión
const { state, saveState } = useSingleFileAuthState('./session.json')

async function startBot() {
    const { version } = await fetchLatestBaileysVersion()
    console.log(`Conectando con Baileys v${version.join('.')}`)

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        version
    })

    // Mensajes entrantes
    conn.ev.on('messages.upsert', async ({ messages, type }) => {
        if (!messages || !messages[0]) return
        const m = messages[0]

        // Mostrar mensaje en consola SOLO GRUPOS
        try {
            if (m.message && m.key.remoteJid?.endsWith('@g.us')) {
                const msgType = Object.keys(m.message)[0]  // tipo real del mensaje
                let content = ''
                
                // Detectar contenido
                if (msgType === 'conversation') content = m.message.conversation
                else if (msgType === 'extendedTextMessage') content = m.message.extendedTextMessage.text
                else if (msgType === 'imageMessage') content = '[Imagen]'
                else if (msgType === 'videoMessage') content = '[Video]'
                else if (msgType === 'stickerMessage') content = '[Sticker]'
                else if (msgType === 'documentMessage') content = '[Documento]'
                else if (msgType === 'audioMessage') content = '[Audio]'
                else content = `[${msgType}]`

                let sender = m.key.participant || m.key.remoteJid
                console.log(`[GRUPO] ${m.key.remoteJid} | ${sender}: ${content}`)
            }
        } catch (err) {
            console.error('Error al mostrar mensaje:', err)
        }

        // Pasar mensaje al handler
        import('./handler.js').then(mod => mod.default(m, { conn }))
    })

    // Guardar credenciales
    conn.ev.on('creds.update', saveState)

    // Estado de conexión
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log('Reconectando...')
                startBot()
            } else {
                console.log('Sesión cerrada. Escaneá el QR de nuevo.')
            }
        } else if(connection === 'open') {
            console.log('✅ Conectado correctamente')
        }
    })

    return conn
}

startBot()
