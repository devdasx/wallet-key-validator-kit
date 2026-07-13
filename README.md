# Wallet Key Validator Kit

[![CI](https://github.com/devdasx/wallet-key-validator-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/devdasx/wallet-key-validator-kit/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/devdasx/wallet-key-validator-kit?sort=semver)](https://github.com/devdasx/wallet-key-validator-kit/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CocoaPods](https://img.shields.io/cocoapods/v/WalletKeyValidatorKit.svg)](https://cocoapods.org/pods/WalletKeyValidatorKit)
[![Swift Package Index](https://img.shields.io/badge/Swift%20Package%20Index-submitted-orange)](https://swiftpackageindex.com/devdasx/wallet-key-validator-kit)
[![Homebrew](https://img.shields.io/badge/Homebrew-devdasx%2Fcrypto--kits-blue)](https://github.com/devdasx/homebrew-crypto-kits)
[![npm](https://img.shields.io/badge/npm-pending-lightgrey)](https://www.npmjs.com/package/wallet-key-validator-kit)
[![PyPI](https://img.shields.io/badge/PyPI-pending-lightgrey)](https://pypi.org/)
[![crates.io](https://img.shields.io/badge/crates.io-pending-lightgrey)](https://crates.io/crates/wallet-key-validator-kit)
[![pub.dev](https://img.shields.io/badge/pub.dev-pending-lightgrey)](https://pub.dev/packages/wallet_key_validator_kit)
[![Maven Central](https://img.shields.io/badge/Maven%20Central-pending-lightgrey)](https://central.sonatype.com/)


Wallet Key Validator Kit validates crypto wallet secrets and HD wallet keys without contacting any blockchain or external API. It now includes real package entry points for JavaScript/Node, Swift, Python, Go, Rust, Dart/Flutter, and Kotlin.

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
npm install github:devdasx/wallet-key-validator-kit#0.2.0
```

When npm registry publishing is configured:

```bash
npm install wallet-key-validator-kit
```

The npm package is designed to be published from GitHub releases. Add an npm automation token as the repository secret `NPM_TOKEN`; after that, published GitHub releases trigger `.github/workflows/npm-publish.yml` and npm receives the package built from the tagged GitHub source.

Use the CLI without installing globally:

```bash
npx github:devdasx/wallet-key-validator-kit#0.2.0 walletkeycheck list-chains --pretty
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

## Language packages

This repository contains real package entry points for:

- JavaScript / Node.js: `package.json`, `src/index.js`, CLI `walletkeycheck`.
- Swift / iOS / macOS: `Package.swift`, `Sources/WalletKeyValidatorKit`, `WalletKeyValidatorKit.podspec`.
- Python: `pyproject.toml`, `python/wallet_key_validator_kit`.
- Go: `go.mod`, `keyvalidator.go`.
- Rust: `Cargo.toml`, `src/lib.rs`.
- Dart / Flutter: `pubspec.yaml`, `lib/wallet_key_validator_kit.dart`.
- Kotlin / JVM / Android-compatible core: Gradle build, `src/main/kotlin`.

The JavaScript package has the broadest BIP-39 mnemonic validation. Native ports currently cover raw private keys, WIF, and serialized BIP32/SLIP132 extended keys.

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
swift test
PYTHONPATH=python python3 -m unittest discover -s python/tests
go test ./...
cargo test
dart test
gradle test
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

## Trust, comparison, and adoption docs

- [Security policy](SECURITY.md)
- [Threat model](docs/security/threat-model.md)
- [Offline-only guarantee](docs/security/offline-only.md)
- [Public test vectors](test-vectors/public-vectors.json)
- [Benchmarks](docs/benchmarks/)
- [Comparison docs](docs/comparisons/)
- Copy-paste examples: [JavaScript](docs/javascript/), [Swift](docs/swift/), [Python](docs/python/), [Rust](docs/rust/), [Go](docs/go/), [Dart](docs/dart/), [Kotlin](docs/kotlin/)

## License

MIT
