import fs from 'fs'
import chalk from 'chalk'
import readline from 'readline'
import { makeWASocket, Browsers } from './lib/simple.js'
import { useMultiFileAuthState } from '@whiskeysockets/baileys'

global.vegetasessions = 'GaaraSessions' // Carpeta de sesiones
const { state, saveCreds } = await useMultiFileAuthState(global.vegetasessions)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

// Número del bot
let phoneNumber = global.botNumber

// Pedir número si no está definido
if (!phoneNumber) {
    do {
        phoneNumber = await question(chalk.greenBright(`[ ⚡ ] Ingrese su número de WhatsApp:\n--> `))
        phoneNumber = phoneNumber.replace(/\D/g,'')
        if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`
    } while (!phoneNumber)
}

// Configuración del socket
const conn = makeWASocket({
    printQRInTerminal: false,
    auth: state,
    browser: Browsers.macOS("Desktop")
})

// Guardar credenciales automáticamente
conn.ev.on('creds.update', saveCreds)

// Evento para pedir el código de 8 dígitos
conn.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update

    if (connection === 'close') {
        console.log(chalk.redBright('[❌] Conexión cerrada, intentando reconectar...'))
    }

    // Si WhatsApp solicita código
    if (update.pairing && update.pairing.code) {
        let code = update.pairing.code.match(/.{1,4}/g)?.join("-") || update.pairing.code
        console.log(chalk.bgMagentaBright.white(`[♡] Código de 8 dígitos:`), chalk.white(code))
        // Aquí podrías automatizar ingreso si tu bot lo permite
    }
})

// Mensaje inicial
console.log(chalk.green.bold(`\n✅ Sesión iniciada en GaaraSessions, esperando código si es necesario...`))

global.conn = conn
