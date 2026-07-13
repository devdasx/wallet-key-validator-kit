import assert from "node:assert/strict";
import test from "node:test";
import {
  encodeWif,
  listChains,
  validateExtendedKey,
  validateMnemonic,
  validatePrivateKey,
  validateWalletKey,
  validateWif
} from "../src/index.js";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const invalidMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";
const privateKeyOne = "0000000000000000000000000000000000000000000000000000000000000001";
const bitcoinWifOne = "KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn";
const bitcoinZpub = "zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs";
const bitcoinZprv = "zprvAdG4iTXWBoARxkkzNpNh8r6Qag3irQB8PzEMkAFeTRXxHpbF9z4QgEvBRmfvqWvGp42t42nvgGpNgYSJA9iefm1yYNZKEm7z6qUWCroSQnE";
const litecoinLtub = "Ltub2YDQmP391UYeDYvLye9P1SuNJFkcRGN7SYHM8JMxaDnegcPTXHJ2BnYmvHnFnGPGKu2WMuCga6iZV3SDxDMGrRyMcrYEfSPhrpS1EPkC43E";

test("validates BIP39 mnemonic checksum and word count", () => {
  assert.equal(validateMnemonic(mnemonic).valid, true);
  const invalid = validateMnemonic(invalidMnemonic);
  assert.equal(invalid.valid, false);
  assert.match(invalid.reason, /checksum/);
});

test("validates secp256k1 private keys for Bitcoin and Ethereum", () => {
  assert.equal(validatePrivateKey(privateKeyOne, { chain: "bitcoin" }).valid, true);
  assert.equal(validatePrivateKey(privateKeyOne, { chain: "ethereum" }).valid, true);
  const zero = validatePrivateKey("00".repeat(32), { chain: "bitcoin" });
  assert.equal(zero.valid, false);
  assert.match(zero.reason, /range/);
});

test("validates Solana ed25519 seed and expanded private-key lengths", () => {
  const seed = "01".repeat(32);
  const expanded = "01".repeat(64);
  assert.equal(validatePrivateKey(seed, { chain: "solana" }).valid, true);
  assert.equal(validatePrivateKey(expanded, { chain: "solana" }).valid, true);
  assert.equal(validatePrivateKey("01".repeat(31), { chain: "solana" }).valid, false);
});

test("validates Bitcoin WIF and rejects wrong chain", () => {
  assert.equal(encodeWif(privateKeyOne, { chain: "bitcoin" }), bitcoinWifOne);
  const result = validateWif(bitcoinWifOne, { chain: "bitcoin" });
  assert.equal(result.valid, true);
  assert.equal(result.compressed, true);
  assert.equal(result.privateKeyHex, privateKeyOne);
  const wrong = validateWif(bitcoinWifOne, { chain: "litecoin" });
  assert.equal(wrong.valid, false);
  assert.match(wrong.reason, /does not match litecoin/);
});

test("validates Litecoin and Dogecoin WIF prefixes", () => {
  const litecoin = encodeWif(privateKeyOne, { chain: "litecoin" });
  const dogecoin = encodeWif(privateKeyOne, { chain: "dogecoin" });
  assert.equal(validateWif(litecoin, { chain: "litecoin" }).version, "0xb0");
  assert.equal(validateWif(dogecoin, { chain: "dogecoin" }).version, "0x9e");
});

test("rejects malformed WIF checksum", () => {
  const bad = `${bitcoinWifOne.slice(0, -1)}x`;
  const result = validateWif(bad, { chain: "bitcoin" });
  assert.equal(result.valid, false);
});

test("validates SLIP132 zpub and zprv extended keys", () => {
  const zpub = validateExtendedKey(bitcoinZpub, { chain: "bitcoin" });
  const zprv = validateExtendedKey(bitcoinZprv, { chain: "bitcoin" });
  assert.equal(zpub.valid, true);
  assert.equal(zpub.prefix, "zpub");
  assert.equal(zpub.keyType, "public");
  assert.equal(zprv.valid, true);
  assert.equal(zprv.prefix, "zprv");
  assert.equal(zprv.keyType, "private");
});

test("validates Litecoin registered extended public key", () => {
  const result = validateExtendedKey(litecoinLtub, { chain: "litecoin" });
  assert.equal(result.valid, true);
  assert.equal(result.prefix, "Ltub");
  assert.equal(result.keyType, "public");
});

test("rejects extended key for incompatible chain", () => {
  const result = validateExtendedKey(bitcoinZpub, { chain: "dogecoin" });
  assert.equal(result.valid, false);
  assert.match(result.reason, /not configured for dogecoin/);
});

test("detects wallet key type with validateWalletKey", () => {
  assert.equal(validateWalletKey(mnemonic).details.kind, "mnemonic");
  assert.equal(validateWalletKey(bitcoinWifOne, { chain: "bitcoin" }).details.kind, "wif");
  assert.equal(validateWalletKey(bitcoinZpub, { chain: "bitcoin" }).details.kind, "extended-key");
  assert.equal(validateWalletKey(privateKeyOne, { chain: "ethereum" }).details.kind, "private-key");
});

test("lists important supported chains", () => {
  const ids = listChains().map((chain) => chain.id);
  for (const id of ["bitcoin", "ethereum", "solana", "dogecoin", "litecoin"]) {
    assert.ok(ids.includes(id), `${id} should be listed`);
  }
});
