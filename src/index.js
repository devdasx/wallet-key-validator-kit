import { secp256k1 } from "@noble/curves/secp256k1.js";
import { ed25519 } from "@noble/curves/ed25519.js";
import { validateMnemonic as scureValidateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { base58CheckDecode, base58CheckEncode, bytesToHex, hexToBytes } from "./base58.js";
import { ED25519_CHAINS, EXTENDED_KEY_VERSIONS, SECP256K1_CHAIN_WIF, listChains } from "./chains.js";

export { base58CheckDecode, base58CheckEncode, bytesToHex, hexToBytes } from "./base58.js";
export { ED25519_CHAINS, EXTENDED_KEY_VERSIONS, SECP256K1_CHAIN_WIF, listChains } from "./chains.js";

export function validateMnemonic(value, options = {}) {
  const phrase = normalizeString(value);
  const words = phrase.split(/\s+/).filter(Boolean);
  const allowedWordCounts = [12, 15, 18, 21, 24];
  if (!allowedWordCounts.includes(words.length)) {
    return invalid("mnemonic", `invalid word count: ${words.length}`, { wordCount: words.length });
  }
  const unknown = words.find((word) => !wordlist.includes(word));
  if (unknown) {
    return invalid("mnemonic", `unknown BIP39 word: ${unknown}`, { wordCount: words.length, unknownWord: unknown });
  }
  const valid = scureValidateMnemonic(phrase, wordlist);
  if (!valid) {
    return invalid("mnemonic", "invalid BIP39 checksum", { wordCount: words.length });
  }
  return validResult("mnemonic", {
    wordCount: words.length,
    language: "english",
    normalized: options.includeNormalized ? phrase : undefined
  });
}

export function validatePrivateKey(value, options = {}) {
  const chain = options.chain || "bitcoin";
  const bytes = parsePrivateKeyBytes(value);
  if (!bytes.ok) return bytes;
  if (SECP256K1_CHAIN_WIF[chain]) {
    const valid = secp256k1.utils.isValidSecretKey(bytes.bytes);
    if (!valid) return invalid("private-key", "invalid secp256k1 private key range", { chain, curve: "secp256k1" });
    return validResult("private-key", {
      chain,
      curve: "secp256k1",
      privateKeyHex: bytesToHex(bytes.bytes)
    });
  }
  if (ED25519_CHAINS[chain]) {
    const lengths = ED25519_CHAINS[chain].privateKeyLengths;
    if (!lengths.includes(bytes.bytes.length)) {
      return invalid("private-key", `${chain} ed25519 private key must be ${lengths.join(" or ")} bytes`, {
        chain,
        curve: "ed25519",
        byteLength: bytes.bytes.length
      });
    }
    try {
      const seed = bytes.bytes.length === 64 ? bytes.bytes.slice(0, 32) : bytes.bytes;
      const publicKey = ed25519.getPublicKey(seed);
      return validResult("private-key", {
        chain,
        curve: "ed25519",
        byteLength: bytes.bytes.length,
        publicKeyHex: bytesToHex(publicKey)
      });
    } catch (error) {
      return invalid("private-key", error.message, { chain, curve: "ed25519" });
    }
  }
  return invalid("private-key", `unsupported chain: ${chain}`, { chain });
}

export function validateWif(value, options = {}) {
  const chain = options.chain || "bitcoin";
  const chainInfo = SECP256K1_CHAIN_WIF[chain];
  if (!chainInfo) return invalid("wif", `unsupported WIF chain: ${chain}`, { chain });
  if (chainInfo.wif === null) return invalid("wif", `${chain} does not normally use WIF`, { chain });
  let payload;
  try {
    payload = base58CheckDecode(value);
  } catch (error) {
    return invalid("wif", error.message, { chain });
  }
  if (![33, 34].includes(payload.length)) {
    return invalid("wif", `invalid WIF payload length: ${payload.length}`, { chain, byteLength: payload.length });
  }
  const version = payload[0];
  const compressed = payload.length === 34;
  if (version !== chainInfo.wif) {
    return invalid("wif", `WIF version byte 0x${version.toString(16)} does not match ${chain}`, {
      chain,
      expectedVersion: `0x${chainInfo.wif.toString(16)}`,
      actualVersion: `0x${version.toString(16)}`
    });
  }
  if (compressed && payload[33] !== 0x01) {
    return invalid("wif", "invalid compressed WIF marker", { chain, marker: `0x${payload[33].toString(16)}` });
  }
  const privateKey = payload.slice(1, 33);
  const keyValidation = validatePrivateKey(privateKey, { chain });
  if (!keyValidation.valid) return invalid("wif", keyValidation.reason, { chain });
  return validResult("wif", {
    chain,
    curve: "secp256k1",
    compressed,
    version: `0x${version.toString(16).padStart(2, "0")}`,
    privateKeyHex: bytesToHex(privateKey)
  });
}

export function validateExtendedKey(value, options = {}) {
  const chain = options.chain;
  let payload;
  try {
    payload = base58CheckDecode(value);
  } catch (error) {
    return invalid("extended-key", error.message, { chain });
  }
  if (payload.length !== 78) {
    return invalid("extended-key", `extended key payload must be 78 bytes, got ${payload.length}`, { chain });
  }
  const versionHex = bytesToHex(payload.slice(0, 4));
  const versionInfo = EXTENDED_KEY_VERSIONS[versionHex];
  if (!versionInfo) {
    return invalid("extended-key", `unknown extended-key version: 0x${versionHex}`, { chain, versionHex });
  }
  if (chain) {
    const chainInfo = SECP256K1_CHAIN_WIF[chain];
    if (!chainInfo) return invalid("extended-key", `unsupported chain: ${chain}`, { chain, versionHex });
    if (!chainInfo.extendedVersions.includes(versionInfo.prefix)) {
      return invalid("extended-key", `${versionInfo.prefix} is not configured for ${chain}`, {
        chain,
        prefix: versionInfo.prefix,
        supported: chainInfo.extendedVersions
      });
    }
  }
  const depth = payload[4];
  const parentFingerprint = payload.slice(5, 9);
  const childNumber = payload.slice(9, 13);
  const chainCode = payload.slice(13, 45);
  const keyData = payload.slice(45, 78);
  if (versionInfo.type === "private") {
    if (keyData[0] !== 0) return invalid("extended-key", "private extended key data must start with 0x00", { prefix: versionInfo.prefix });
    const privateKey = keyData.slice(1);
    if (!secp256k1.utils.isValidSecretKey(privateKey)) {
      return invalid("extended-key", "invalid private key inside extended key", { prefix: versionInfo.prefix });
    }
  } else {
    if (!secp256k1.utils.isValidPublicKey(keyData)) {
      return invalid("extended-key", "invalid compressed public key inside extended key", { prefix: versionInfo.prefix });
    }
  }
  return validResult("extended-key", {
    chain: chain || versionInfo.family,
    prefix: versionInfo.prefix,
    keyType: versionInfo.type,
    versionHex,
    depth,
    parentFingerprintHex: bytesToHex(parentFingerprint),
    childNumberHex: bytesToHex(childNumber),
    chainCodeHex: bytesToHex(chainCode)
  });
}

export function validateWalletKey(value, options = {}) {
  const candidates = [
    validateMnemonic(value, options),
    validateExtendedKey(value, options),
    validateWif(value, options),
    validatePrivateKey(value, options)
  ];
  const valid = candidates.find((candidate) => candidate.valid);
  if (valid) return validResult("wallet-key", { detected: valid.kind, details: valid });
  return invalid("wallet-key", "value did not validate as mnemonic, extended key, WIF, or private key", {
    attempts: candidates.map((candidate) => ({ kind: candidate.kind, reason: candidate.reason }))
  });
}

export function encodeWif(privateKeyHex, options = {}) {
  const chain = options.chain || "bitcoin";
  const chainInfo = SECP256K1_CHAIN_WIF[chain];
  if (!chainInfo || chainInfo.wif === null) throw new Error(`${chain} does not support WIF`);
  const privateKey = hexToBytes(privateKeyHex);
  if (!secp256k1.utils.isValidSecretKey(privateKey)) throw new Error("invalid secp256k1 private key");
  const compressed = options.compressed !== false;
  const suffix = compressed ? new Uint8Array([0x01]) : new Uint8Array();
  return base58CheckEncode(concat(new Uint8Array([chainInfo.wif]), privateKey, suffix));
}

function parsePrivateKeyBytes(value) {
  try {
    if (value instanceof Uint8Array) {
      if (![32, 64].includes(value.length)) return invalid("private-key", `private key must be 32 or 64 bytes, got ${value.length}`, { byteLength: value.length });
      return { ok: true, bytes: value };
    }
    if (typeof value !== "string") return invalid("private-key", "private key must be hex string or bytes", {});
    const bytes = hexToBytes(value);
    if (![32, 64].includes(bytes.length)) return invalid("private-key", `private key must be 32 or 64 bytes, got ${bytes.length}`, { byteLength: bytes.length });
    return { ok: true, bytes };
  } catch (error) {
    return invalid("private-key", error.message, {});
  }
}

function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.normalize("NFKD").trim().replace(/\s+/g, " ");
}

function validResult(kind, data = {}) {
  return clean({ valid: true, kind, ...data });
}

function invalid(kind, reason, data = {}) {
  return clean({ valid: false, kind, reason, ...data });
}

function clean(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));
}

function concat(...chunks) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}
