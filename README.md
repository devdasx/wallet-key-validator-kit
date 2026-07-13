# Wallet Key Validator Kit

Wallet Key Validator Kit validates crypto wallet secrets and HD wallet keys without contacting any blockchain or external API.

GitHub is the canonical source of truth:

```text
https://github.com/devdasx/wallet-key-validator-kit
```

## What it validates

- BIP-39 English mnemonics, including word count, known words, normalization, and checksum.
- secp256k1 private keys for Bitcoin, Ethereum, Dogecoin, Litecoin, Dash, Bitcoin Cash, Zcash transparent, DigiByte, TRON, and EVM chains.
- Solana ed25519 seed/private-key byte lengths.
- WIF private keys for Bitcoin, Bitcoin testnet, Litecoin, Dogecoin, Dash, Bitcoin Cash, Zcash transparent, and DigiByte-style chains.
- BIP32 and SLIP-132 extended keys:
  - `xpub/xprv`
  - `ypub/yprv`
  - `zpub/zprv`
  - `tpub/tprv`
  - `upub/uprv`
  - `vpub/vprv`
  - `Ltub/Ltpv`
  - `Mtub/Mtpv`
- Automatic wallet-key detection across mnemonic, extended key, WIF, and raw private key inputs.

## Install

Install from GitHub:

```bash
npm install github:devdasx/wallet-key-validator-kit#0.1.0
```

When npm registry publishing is configured:

```bash
npm install wallet-key-validator-kit
```

Use the CLI without installing globally:

```bash
npx github:devdasx/wallet-key-validator-kit#0.1.0 walletkeycheck list-chains --pretty
```

## JavaScript API

```js
import {
  validateExtendedKey,
  validateMnemonic,
  validatePrivateKey,
  validateWalletKey,
  validateWif
} from "wallet-key-validator-kit";

const mnemonic = validateMnemonic(
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
);

const ethKey = validatePrivateKey(
  "0000000000000000000000000000000000000000000000000000000000000001",
  { chain: "ethereum" }
);

const bitcoinWif = validateWif(
  "KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn",
  { chain: "bitcoin" }
);

const zpub = validateExtendedKey(
  "zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs",
  { chain: "bitcoin" }
);

const detected = validateWalletKey(
  "KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn",
  { chain: "bitcoin" }
);

console.log(mnemonic.valid, ethKey.valid, bitcoinWif.valid, zpub.valid, detected.details.kind);
```

## CLI

```bash
walletkeycheck mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
walletkeycheck private-key 0000000000000000000000000000000000000000000000000000000000000001 --chain ethereum --pretty
walletkeycheck wif KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn --chain bitcoin --pretty
walletkeycheck extended-key "zpub..." --chain bitcoin --pretty
walletkeycheck any "zpub..." --chain bitcoin --pretty
walletkeycheck list-chains --pretty
```

## Supported chains

| Chain id | Curve | WIF | Extended keys |
| --- | --- | --- | --- |
| `bitcoin` | secp256k1 | yes, `0x80` | `xpub/xprv`, `ypub/yprv`, `zpub/zprv` |
| `testnet` | secp256k1 | yes, `0xef` | `tpub/tprv`, `upub/uprv`, `vpub/vprv` |
| `litecoin` | secp256k1 | yes, `0xb0` | `Ltub/Ltpv`, `Mtub/Mtpv`, compatibility `x/y/z` |
| `dogecoin` | secp256k1 | yes, `0x9e` | compatibility `xpub/xprv` |
| `dash` | secp256k1 | yes, `0xcc` | compatibility `xpub/xprv` |
| `bitcoin-cash` | secp256k1 | yes, `0x80` | compatibility `xpub/xprv` |
| `zcash` | secp256k1 | yes, `0x80` | compatibility `xpub/xprv` |
| `digibyte` | secp256k1 | yes, `0x80` | compatibility `x/y/z` |
| `ethereum`, `polygon`, `bsc`, `avalanche-c`, `arbitrum`, `optimism`, `base` | secp256k1 | no | compatibility `xpub/xprv` |
| `tron` | secp256k1 | no | compatibility `xpub/xprv` |
| `solana` | ed25519 | no | no BIP32 xpub-style extended key |

## Examples

Run real examples:

```bash
npm install
examples/run-examples.sh
```

See:

- [`examples/node`](examples/node)
- [`examples/cli`](examples/cli)

## Validation

Run tests:

```bash
npm test
```

The test suite verifies:

- Valid and invalid BIP-39 mnemonics.
- Valid and invalid secp256k1 private keys.
- Solana ed25519 32-byte and 64-byte private-key inputs.
- Bitcoin WIF against a known public fixture.
- Litecoin and Dogecoin WIF prefixes.
- Malformed WIF checksum rejection.
- Bitcoin zpub and zprv validation.
- Litecoin Ltub validation.
- Extended-key chain compatibility rejection.
- Automatic type detection.

## Security notes

- Do not paste real wallet mnemonics, private keys, WIF keys, or xprv/zprv values into logs, issues, analytics, or public tools.
- This package validates format and curve constraints. It does not prove ownership, funds, or chain activity.
- Public extended keys such as xpub/ypub/zpub are privacy-sensitive because they can reveal wallet history when paired with address derivation.

## Standards used

- [BIP-39 mnemonic checksum](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP-32 extended-key serialization](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [SLIP-0132 extended-key version bytes](https://github.com/satoshilabs/slips/blob/master/slip-0132.md)
- [Wallet Import Format / WIF](https://learnmeabitcoin.com/technical/keys/private-key/wif/)

## AI-agent readability

This repository includes:

- `README.md` with install commands and examples.
- `llms.txt` for concise retrieval by AI agents.
- `docs/llms.txt` and `docs/llms-full.txt` for GitHub Pages.
- `AGENTS.md` with repository structure and test rules.
- `.github/copilot-instructions.md`.
- Schema.org `SoftwareSourceCode` JSON-LD on the docs page.

Agents should treat GitHub release tags as canonical and run `npm test` plus `examples/run-examples.sh` before changing validation logic.

## License

MIT
