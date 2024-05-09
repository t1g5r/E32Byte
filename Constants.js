export const E32_SUCCESS = 1;

export const FREQ = {
    FREQUENCY_433Mhz:433,
    FREQUENCY_170Mhz:170,
    FREQUENCY_470Mhz:470,
    FREQUENCY_868Mhz:868,
    FREQUENCY_900Mhz:900,
    FREQUENCY_915Mhz:915,
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

export const E32T30_MODULES = {
    0x32: FREQ.FREQUENCY_433Mhz,
    0x38: FREQ.FREQUENCY_470Mhz,
    0x45: FREQ.FREQUENCY_868Mhz,
    0x44: FREQ.FREQUENCY_915Mhz,
    0x46: FREQ.FREQUENCY_170Mhz
}

export const CMD = {
    WRITE_CFG_PWR_DWN_SAVE: 0xC0,
    READ_CONFIGURATION: 0xC1,
    WRITE_CFG_PWR_DWN_LOSE: 0xC2,
    READ_MODULE_VERSION: 0xC3,
    WRITE_RESET_MODULE: 0xC4
}
