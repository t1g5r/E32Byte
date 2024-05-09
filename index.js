import { SerialPort } from 'serialport';
import { E32Config } from "./E32Config.js";
import { ByteLengthParser } from '@serialport/parser-byte-length';
import { CMD } from "./Constants.js";
import {E32Version} from "./E32Version.js";

const IsHex = (S) => { return parseInt(S,16).toString(16)===S.toLowerCase() }

export class E32Core {
    port;
    parser;

    #buf;
    #cfgcallback = null;
    #MAX_READ  = 0;

    isopen = false;
    lasterr = null;

    constructor({ path, callback=null, baudRate=9600,dataBits = 8, stopBits = 1 }) {
        this.port = new SerialPort({
            path:           path,
            baudRate:        baudRate,
            dataBits:        dataBits,
            stopBits:        stopBits,
        }, (err) => {
            if (err) {
                this.lasterr = err;
                return console.log('Error opening port:', err.message);
            }
        });

        this.parser = this.port.pipe(new ByteLengthParser({ length: 1 }));
        this.parser.on('ready', () => console.log('the ready byte sequence has been received'))
        this.parser.on('data', (data) => {
            if (typeof this.cfgcallback === "function") {
                --this.MAX_READ;
                this.buf === null ? this.buf =data : this.buf = Buffer.concat([this.buf,data]);
                if (this.MAX_READ===0) {
                    this.cfgcallback();
                }
            } else {
                if (typeof callback === "function" ) {
                    callback(data);
                }
            }
        });
        this.port.on('error', (err) => {
            this.lasterr = err;
        });
        this.port.on('open', () => {
            this.isopen = true;
        });
    }

    open = () => {
        return new Promise((resolve, reject) => {
            this.port.open((err) => {
                if (err) {
                    reject(err);
                } else {
                    this.isopen = true;
                    resolve();
                }
            });
        });
    }
    getVersion = (callback) => {
        if (typeof callback !== "function") return false;
        const data = Buffer.from([CMD.READ_MODULE_VERSION, CMD.READ_MODULE_VERSION, CMD.READ_MODULE_VERSION]);
        this.port.write(data, (err) => {
            if (!err) {
                this.buf = null;
                this.MAX_READ=4;
                this.cfgcallback = () => {
                    let e32ver = E32Version.parseHex(this.buf.toString('hex'));
                    callback(e32ver);
                }
            } else {
                callback(false);
            }
        });
        return true;
    }

    setConfig = (cfg,callback) => {
        let bcfg = false;
        if (cfg instanceof E32Config) bcfg = cfg.bytes();
        if (cfg instanceof Buffer && cfg.length === 6) bcfg = cfg;
        if (!bcfg) return false;

        this.#sendBuffer(bcfg,callback);
        return true;
    }

    getConfig = (callback) => {
        if (typeof callback !== "function") return false;
        const data = Buffer.from([CMD.READ_CONFIGURATION, CMD.READ_CONFIGURATION, CMD.READ_CONFIGURATION]);
        this.port.write(data, (err) => {
            if (!err) {
                this.buf = null;
                this.MAX_READ=6;
                this.cfgcallback = () => {
                    if (this.buf.length === 6) {
                        let e32cfg = E32Config.parseHex(this.buf.toString('hex'));
                        callback(e32cfg);
                    }
                }
            } else {
                callback(false);
            }
        });
        return true;
    }

    close = () => {
        return new Promise((resolve, reject) => {
            this.port.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    this.isopen = false;
                    resolve();
                }
            });
        });
    }

    #sendBuffer = (bufPacket,callback=null) => {
        this.port.write(bufPacket, (err) => {
            if (typeof callback === "function") {
                !err ? callback(true) : callback(false);
            }
        });
    }
    sendFixedMessage = (addr,chan,message,callback=null) => {
        if (IsHex(addr) && IsHex(chan) ) {
            const bufAddr = Buffer.from(addr, "hex");
            const bufChan = Buffer.from(chan, "hex");
            let bufMSG = message;

            if (!Buffer.isBuffer(bufMSG)) {
                bufMSG = Buffer.from(message);
            }

            // Concatenate all buffers
            const bufPacket = Buffer.concat([bufAddr, bufChan, bufMSG]);

            this.#sendBuffer(bufPacket,callback);

            return true;
        } else {
            return false;
        }
    }
    sendBroadcastFixedMessage = (chan,message,callback=null) => {
        return this.sendFixedMessage("FFFF",chan,message,callback);
    }

    sendMessage = (message,callback) => {
        let bufMSG = message;

        if (!Buffer.isBuffer(bufMSG)) {
            bufMSG = Buffer.from(message);
        }

        this.#sendBuffer(bufMSG,callback);
        return true;
    }


}
