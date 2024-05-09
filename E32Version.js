import log from "loglevel";
import {CMD, E32T30_MODULES} from "./Constants.js";


export class E32Version {

    constructor() {
        this.head = CMD.READ_MODULE_VERSION;
        this.frequency = 0;
        this.version = 0;
        this.features = 0;
    }

    /*
        C3 32 xx yy. the second bytes means frequency.
        32 here means the frequency is 433MHZ,
        38 means frequency is 470MHz,
        45 means frequency is 868MHz,
        44 means the frequency is 915 MHz,
        46 means the frequency is 170MHz;
        xx is the version number and yy refers to the other module features.
    * */

    static parseHex(hexinput) {

        let hexstr = hexinput.replace(/ /g, '');
        let decoded;

        try {
            decoded = Buffer.from(hexstr, 'hex');
        } catch (err) {
            log.error(err);
            process.exit(1);
        }
        if (decoded.length !== 4) {
            log.error("Hex string too short for E32 version!");
            process.exit(1);
        }
        const version = new E32Version();
        version.head = decoded[0];
        if (E32T30_MODULES[decoded[1]]) {
            version.frequency = E32T30_MODULES[decoded[1]];
        }
        version.features = decoded[2];

        return version;
    }
}

