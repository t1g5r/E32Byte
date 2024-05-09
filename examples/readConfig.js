import { E32Core } from "../index.js";
let e32 = new E32Core({path:"/dev/ttyUSB0",callback: (data) => {}});

e32.getConfig((cfg) => {
    if (cfg) {
        cfg.printConfig();
    }
});
