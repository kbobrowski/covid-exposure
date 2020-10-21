import hmacSHA256 from 'crypto-js/hmac-sha256';
import aes from 'crypto-js/aes';
import CryptoJS from "crypto-js/core";
import noPadding from 'crypto-js/pad-nopadding';
import modeEcb from 'crypto-js/mode-ecb';
import modeCtr from 'crypto-js/mode-ctr';
import {ROLLING_PERIOD} from "./constants";
import {DiagnosisKey, RpiWithInterval} from "./types";

export const uint8ToWord = (array: Uint8Array): CryptoJS.lib.WordArray => {
	const words: number[] = []
	let i = 0
	const len = array.length

	while (i < len) {
		words.push(
			(array[i++] << 24) |
			(array[i++] << 16) |
			(array[i++] << 8)  |
			(array[i++])
		);
	}

	return CryptoJS.lib.WordArray.create(words, words.length * 4)
}

const wordToUint8 = (wordArray: CryptoJS.lib.WordArray): Uint8Array => {
	const len = wordArray.words.length
	const u8_array = new Uint8Array(len << 2)
	let offset = 0
	for (let i=0; i<len; i++) {
		const word = wordArray.words[i];
		u8_array[offset++] = word >> 24;
		u8_array[offset++] = (word >> 16) & 0xff;
		u8_array[offset++] = (word >> 8) & 0xff;
		u8_array[offset++] = word & 0xff;
	}
	return u8_array;
}

const deriveKey = (tek: CryptoJS.lib.WordArray, info: string): CryptoJS.lib.WordArray => {
	const salt = CryptoJS.lib.WordArray.create([0], 4);
	const pseudoRandomKey = hmacSHA256(tek, salt)
	const counter = CryptoJS.lib.WordArray.create([0x1 << 24], 1);
	const mac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, pseudoRandomKey)
	mac.update(info)
	const words = mac.finalize(counter).words.slice(0, 4)
	return CryptoJS.lib.WordArray.create(words, 16)
}

const deriveRpiKey = (tek: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
	return deriveKey(tek, "EN-RPIK");
}

const deriveAemKey = (tek: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
	return deriveKey(tek, "EN-AEMK");
}

const deriveRpi = (rpiKey: CryptoJS.lib.WordArray, data: CryptoJS.lib.WordArray, interval: number): RpiWithInterval => {
	const rpiWord = aes.encrypt(data, rpiKey, {mode: modeEcb, padding: noPadding}).ciphertext
	return {
		rpi: rpiWord,
		rpiSerialized: rpiWord.toString(),
		interval
	}
}

const decryptAem = (aemKey: CryptoJS.lib.WordArray, rpi: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
	const zero = CryptoJS.lib.WordArray.create([0], 4);
	return CryptoJS.lib.WordArray.create(aes
		.encrypt(zero, aemKey, {mode: modeCtr, padding: noPadding, iv: rpi})
		.ciphertext
		.words
		.slice(0, 1), 4)
}

export const deriveRpisForDk = (dk: DiagnosisKey): RpiWithInterval[] => {
	const rpisList: RpiWithInterval[] = []
	const rpiKey = deriveRpiKey(uint8ToWord(dk.tek))
	const data = CryptoJS.lib.WordArray.create([
		(0x45 << 24) | (0x4E << 16) | (0x2D << 8) | 0x52,
		(0x50 << 24) | (0x49 << 16),
		0x0,
    0x0
	], 16);
	for (let i = dk.rollingStart; i < dk.rollingStart + ROLLING_PERIOD; i++) {
		data.words[3] = ((i & 0xff) << 24) | ((i & 0xff00) << 8) | ((i & 0xff0000) >> 8) | ((i & 0xff000000) >> 24)
		rpisList.push(deriveRpi(rpiKey, data, i))
	}
	return rpisList
}

export const getAemXorBytes = (dk: DiagnosisKey, rpi: RpiWithInterval): Uint8Array => {
	const aemKey = deriveAemKey(uint8ToWord(dk.tek))
	const decrypted = decryptAem(aemKey, rpi.rpi)
	return wordToUint8(decrypted)
}
