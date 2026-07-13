# Agent guide for Wallet Key Validator Kit

This repository validates wallet key formats. GitHub is the source of truth.

## Identity

- Repository: `devdasx/wallet-key-validator-kit`
- npm package: `wallet-key-validator-kit`
- CLI: `walletkeycheck`

## Layout

- `src/index.js`: public validators.
- `src/base58.js`: Base58 and Base58Check helpers.
- `src/chains.js`: chain metadata, WIF prefixes, and extended-key version registry.
- `bin/walletkeycheck.js`: CLI.
- `test`: real validation tests.
- `examples`: runnable examples.
- `docs`: GitHub Pages and LLM-readable docs.

## Validate changes

Run:

```bash
npm test
examples/run-examples.sh
npm pack --dry-run
```

## Rules

- Never put real private keys or mnemonics in tests, docs, logs, or issue text.
- Use only public test fixtures.
- Preserve checksum validation for BIP-39, WIF/Base58Check, and BIP32/SLIP132.
- Keep README, package metadata, `llms.txt`, docs, and examples aligned.
