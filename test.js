import { E32Config } from "./E32Config.js";
import { E32Version } from "./E32Version.js";
let fail = false;
const config = E32Config.parseHex('c000012407d4');

let bytes = config.bytes();
if (bytes.toString('hex') !== 'c000012407d4') {
    console.log('CONFIG FAIL */1');
    fail=true;
}
if (config.addr !== 1) {
    console.log('CONFIG FAIL ADDR */2');
    fail=true;
}
if (config.channel !== 7) {
    console.log('CONFIG FAIL CHANNEL */2');
    fail=true;
}
if (config.head !== 192) {
    console.log('CONFIG FAIL HEAD */2');
    fail=true;
}
try {
    config.printConfig();
} catch (e) {
    console.log("CONFIG PRINT FAIL!");
    fail=true;
}
// 900T20D
// 32 10 14
const ver = E32Version.parseHex('c3321014');
if (ver.frequency!==433) {
    console.log("VER FAIL FREQ */1");
    fail=true;
}
if (ver.features !== 16) {
    console.log("VER FAIL FEATURES */2");
    fail=true;
}

console.log('---------------------------');
// 170T30D
// 46 0d 1e
const ver2 = E32Version.parseHex('c3460d1e');
if (ver2.frequency!==170) {
    console.log("VER FAIL FREQ */1");
    fail=true;
}
if (ver2.features !== 13) {
    console.log("VER FAIL FEATURES */2");
    fail=true;
}


console.log('---------------------------');
fail ? console.log('OPS FAIL') : console.log('ALL FINE!');
