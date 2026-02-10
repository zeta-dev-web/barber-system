import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

let whatsappClient = null;
let isReady = false;

async function connectWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./whatsapp-session');
    const { version } = await fetchLatestBaileysVersion();
    
    whatsappClient = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        version,
        browser: ['Barberia System', 'Chrome', '1.0.0'],
        defaultQueryTimeoutMs: undefined
    });

    whatsappClient.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 Escanea este código QR con WhatsApp:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ WhatsApp desconectado. Reconectando:', shouldReconnect);
            isReady = false;
            if (shouldReconnect) {
                setTimeout(() => connectWhatsApp(), 5000);
            }
        } else if (connection === 'open') {
            isReady = true;
            console.log('✅ WhatsApp conectado correctamente');
        }
    });

    whatsappClient.ev.on('creds.update', saveCreds);
}

if (process.env.WHATSAPP_ENABLED === 'true') {
    connectWhatsApp().catch(err => {
        console.error('❌ Error al iniciar WhatsApp:', err.message);
    });
} else {
    console.warn('⚠️ WhatsApp deshabilitado (configura WHATSAPP_ENABLED=true en .env)');
}

export { whatsappClient, isReady };
export default whatsappClient;
