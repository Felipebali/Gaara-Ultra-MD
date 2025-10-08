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

        // Mostrar mensaje en consola
        try {
            if (m.message) {
                let text = m.message.conversation || m.message.extendedTextMessage?.text
                let sender = m.key.participant || m.key.remoteJid
                if(text) console.log(`[${sender}]: ${text}`)
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
