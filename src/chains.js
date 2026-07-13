export const SECP256K1_CHAIN_WIF = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", wif: 0x80, extendedVersions: ["xpub", "xprv", "ypub", "yprv", "zpub", "zprv"] },
  testnet: { name: "Bitcoin Testnet", symbol: "TBTC", wif: 0xef, extendedVersions: ["tpub", "tprv", "upub", "uprv", "vpub", "vprv"] },
  litecoin: { name: "Litecoin", symbol: "LTC", wif: 0xb0, extendedVersions: ["Ltub", "Ltpv", "Mtub", "Mtpv", "xpub", "xprv", "ypub", "yprv", "zpub", "zprv"] },
  dogecoin: { name: "Dogecoin", symbol: "DOGE", wif: 0x9e, extendedVersions: ["xpub", "xprv"] },
  dash: { name: "Dash", symbol: "DASH", wif: 0xcc, extendedVersions: ["xpub", "xprv"] },
  "bitcoin-cash": { name: "Bitcoin Cash", symbol: "BCH", wif: 0x80, extendedVersions: ["xpub", "xprv"] },
  zcash: { name: "Zcash transparent", symbol: "ZEC", wif: 0x80, extendedVersions: ["xpub", "xprv"] },
  digibyte: { name: "DigiByte", symbol: "DGB", wif: 0x80, extendedVersions: ["xpub", "xprv", "ypub", "yprv", "zpub", "zprv"] },
  ethereum: { name: "Ethereum", symbol: "ETH", wif: null, extendedVersions: ["xpub", "xprv"], evm: true },
  "ethereum-classic": { name: "Ethereum Classic", symbol: "ETC", wif: null, extendedVersions: ["xpub", "xprv"], evm: true },
  polygon: { name: "Polygon", symbol: "MATIC", wif: null, extendedVersions: ["xpub", "xprv"], evm: true },
  bsc: { name: "BNB Smart Chain", symbol: "BNB", wif: null, extendedVersions: ["xpub", "xprv"], evm: true },
  "avalanche-c": { name: "Avalanche C-Chain", symbol: "AVAX", wif: null, extendedVersions: ["xpub", "xprv"], evm: true },
  arbitrum: { name: "Arbitrum", symbol: "ARB", wif: null, extendedVersions: ["xpub", "xprv"], evm: true },
  optimism: { name: "Optimism", symbol: "OP", wif: null, extendedVersions: ["xpub", "xprv"], evm: true },
  base: { name: "Base", symbol: "BASE", wif: null, extendedVersions: ["xpub", "xprv"], evm: true },
  tron: { name: "TRON", symbol: "TRX", wif: null, extendedVersions: ["xpub", "xprv"] }
};

export const ED25519_CHAINS = {
  solana: { name: "Solana", symbol: "SOL", privateKeyLengths: [32, 64] }
};

export const EXTENDED_KEY_VERSIONS = {
  "0488b21e": { prefix: "xpub", type: "public", family: "bitcoin" },
  "0488ade4": { prefix: "xprv", type: "private", family: "bitcoin" },
  "049d7cb2": { prefix: "ypub", type: "public", family: "bitcoin" },
  "049d7878": { prefix: "yprv", type: "private", family: "bitcoin" },
  "04b24746": { prefix: "zpub", type: "public", family: "bitcoin" },
  "04b2430c": { prefix: "zprv", type: "private", family: "bitcoin" },
  "043587cf": { prefix: "tpub", type: "public", family: "testnet" },
  "04358394": { prefix: "tprv", type: "private", family: "testnet" },
  "044a5262": { prefix: "upub", type: "public", family: "testnet" },
  "044a4e28": { prefix: "uprv", type: "private", family: "testnet" },
  "045f1cf6": { prefix: "vpub", type: "public", family: "testnet" },
  "045f18bc": { prefix: "vprv", type: "private", family: "testnet" },
  "019da462": { prefix: "Ltub", type: "public", family: "litecoin" },
  "019d9cfe": { prefix: "Ltpv", type: "private", family: "litecoin" },
  "01b26ef6": { prefix: "Mtub", type: "public", family: "litecoin" },
  "01b26792": { prefix: "Mtpv", type: "private", family: "litecoin" }
};

export function listChains() {
  return [
    ...Object.entries(SECP256K1_CHAIN_WIF).map(([id, chain]) => ({
      id,
      name: chain.name,
      symbol: chain.symbol,
      curve: "secp256k1",
      supportsWif: chain.wif !== null,
      extendedVersions: chain.extendedVersions
    })),
    ...Object.entries(ED25519_CHAINS).map(([id, chain]) => ({
      id,
      name: chain.name,
      symbol: chain.symbol,
      curve: "ed25519",
      supportsWif: false,
      extendedVersions: []
    }))
  ];
}
