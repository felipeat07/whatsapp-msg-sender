import { create, Whatsapp, Message, SocketState } from 'venom-bot'
import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js'

export type QRCode = {
    base64Qr: string
}

class Sender {
    private client: Whatsapp
    private connected: boolean
    private qr: QRCode

    get isConnected(): boolean {
        return this.connected
    }

    get qrCode(): QRCode {
        return this.qr
    }

    constructor() {
        this.initialize()
    }

    async sendText(to: string, body: string) {
        //5521979637964@c.us Formato válido
        if (!isValidPhoneNumber(to, "BR")) {
            throw new Error("Número inválido")
        }
        let phoneNumber = parsePhoneNumber(to, "BR")?.format("E.164")?.replace("+", "") as string;

        await this.client.sendText(`${phoneNumber}@c.us`, body)
    }

    private initialize() {
        const qr = (base64Qr: string) => {
            this.qr = { base64Qr }
        }

        const status = (statusSession: string) => {
            //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
            //Create session wss return "serverClose" case server for close
            this.connected = ["isLogged", "qrReadSuccess", "chatsAvailable"].includes(statusSession)
        }

        const start = (client: Whatsapp) => {
            this.client = client;

            client.onStateChange((state) => {
                this.connected = state === SocketState.CONNECTED
            })


        }
        create('ws-sender-dev', qr, status)
            .then((client) => start(client))
            .catch((error) => console.error(error))
    }
}

export default Sender;