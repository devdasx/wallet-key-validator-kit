import {
  validateExtendedKey,
  validateMnemonic,
  validatePrivateKey,
  validateWalletKey,
  validateWif
} from "../../src/index.js";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const privateKey = "0000000000000000000000000000000000000000000000000000000000000001";
const bitcoinWif = "KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn";
const bitcoinZpub = "zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs";

const checks = [
  validateMnemonic(mnemonic),
  validatePrivateKey(privateKey, { chain: "ethereum" }),
  validateWif(bitcoinWif, { chain: "bitcoin" }),
  validateExtendedKey(bitcoinZpub, { chain: "bitcoin" }),
  validateWalletKey(bitcoinZpub, { chain: "bitcoin" })
];

for (const check of checks) {
  if (!check.valid) throw new Error(`${check.kind} failed: ${check.reason}`);
}

console.log("mnemonic valid:", checks[0].valid);
console.log("ethereum private key valid:", checks[1].valid);
console.log("bitcoin WIF valid:", checks[2].valid);
console.log("bitcoin zpub valid:", checks[3].valid);
console.log("auto-detected wallet key:", checks[4].detected);
