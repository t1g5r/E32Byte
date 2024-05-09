import { CMD } from "./Constants.js";
import log from 'loglevel';

// Constants similar to Go
const Constants = {
    ConfigPermanent:    CMD.WRITE_CFG_PWR_DWN_SAVE,
    ConfigTemporary:    CMD.WRITE_CFG_PWR_DWN_LOSE,
    SerialParity:       ["8N1", "8O1", "8E1", "8N13"],
    SerialRate:         [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
    WirelessRate:       [1, 2, 5, 8, 10, 15, 20, 25],
    TransmissionMode:   ["transparent", "fixed"],
    IoMode:             ["open", "push-pull"],
    Channel433:         0x50
};

export class E32Config {
    constructor() {
        this.head = Constants.ConfigTemporary;
        this.addr = 0xFFFF;
        this.parity = 0;
        this.ttlrate = 3 << 3; // 9600 baud rate
        this.wirelessrate = 0; // 1K
        this.channel = Constants.Channel433;
        this.transmissionmode = 0;
        this.iomode = 1 << 6; // push-pull
        this.wakeuptime = 0;
        this.fec = 1 << 2;
        this.power = 0;
    }

    static parseHex(hexinput) {

        let hexstr = hexinput.replace(/ /g, '');
        let decoded;

        try {
            decoded = Buffer.from(hexstr, 'hex');
        } catch (err) {
            log.error(err);
            process.exit(1);
        }
        if (decoded.length !== 6) {
            log.error("Hex string too short for E32 config!");
            process.exit(1);
        }

        const config = new E32Config();
        config.head = decoded[0];
        config.addr = decoded.readUInt16BE(1);
        config.parity = decoded[3] & (0xC0);
        config.ttlrate = decoded[3] & (0x38);
        config.wirelessrate = decoded[3] & (0x07);
        config.channel = decoded[4];
        config.transmissionmode = decoded[5] & (0x80);
        config.iomode = decoded[5] & (0x40);
        config.wakeuptime = decoded[5] & (0x38);
        config.fec = decoded[5] & (0x04);
        config.power = decoded[5] & (0x03);

        return config;
    }

    bytes() {
        const bytes = Buffer.alloc(6);
        bytes[0] = this.head;
        bytes.writeUInt16BE(this.addr, 1);
        bytes[3] = this.parity | this.ttlrate | this.wirelessrate;
        bytes[4] = this.channel;
        bytes[5] = this.transmissionmode | this.iomode | this.wakeuptime | this.fec | this.power;
        return bytes;
    }

    printConfig() {
        const cfgBytes = this.bytes();

        console.log("\nConfig HEX bytes:");
        console.log(cfgBytes.toString('hex').toUpperCase());

        console.log(this.head === Constants.ConfigPermanent ? "- Permanent" : "- Temporary");
        console.log(`- Addr: ${this.addr.toString(16).padStart(4, '0').toUpperCase()}`);
        console.log(`- Parity: ${Constants.SerialParity[this.parity >> 6]}`);
        console.log(`- Serial Rate: ${Constants.SerialRate[this.ttlrate >> 3]}`);
        console.log(`- Wireless Rate: ${Constants.WirelessRate[this.wirelessrate]}K`);
        console.log(`- Channel: ${this.channel}`);
        console.log(`- Transmission Mode: ${Constants.TransmissionMode[this.transmissionmode >> 7]}`);
        console.log(`- IO Mode: ${Constants.IoMode[this.iomode >> 6]}`);
        console.log(`- Response Time: ${((1 + (this.wakeuptime >> 3)) * 250)}ms`);
        console.log(`- FEC: ${this.fec >> 2}`);
        console.log(`- Transmit Power: ${30 - this.power * 3}dBm`);
    }
}
