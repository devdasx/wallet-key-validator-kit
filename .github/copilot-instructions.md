# Copilot instructions for Wallet Key Validator Kit

This package validates wallet secrets and HD keys. Treat validation logic as security-sensitive.

- Run `npm test` after changing `src`.
- Run `examples/run-examples.sh` after changing examples, CLI, README, or exports.
- Preserve BIP-39, WIF/Base58Check, BIP32, and SLIP-132 validation behavior.
- Use only public test fixtures. Do not add real wallet secrets.
