#!/usr/bin/env node
import {
  listChains,
  validateExtendedKey,
  validateMnemonic,
  validatePrivateKey,
  validateWalletKey,
  validateWif
} from "../src/index.js";

const version = "0.1.0";

function usage() {
  console.log(`walletkeycheck ${version}

Usage:
  walletkeycheck mnemonic "abandon abandon ..."
  walletkeycheck private-key <hex> --chain ethereum
  walletkeycheck wif <wif> --chain bitcoin
  walletkeycheck extended-key <xpub-or-zprv> --chain bitcoin
  walletkeycheck any <value> --chain bitcoin
  walletkeycheck list-chains

Options:
  --chain NAME    Chain id, for example bitcoin, ethereum, solana, litecoin, dogecoin.
  --pretty        Pretty-print JSON.
  --help          Show help.
`);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      args._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === "pretty" || key === "help") {
      args[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined) throw new Error(`missing value for ${arg}`);
    args[key] = value;
    index += 1;
  }
  return args;
}

try {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  const value = args._.slice(1).join(" ");
  if (!command || args.help || command === "help") {
    usage();
    process.exit(0);
  }
  if (command === "version") {
    console.log(version);
    process.exit(0);
  }
  if (command === "list-chains") {
    console.log(JSON.stringify(listChains(), null, args.pretty ? 2 : 0));
    process.exit(0);
  }
  const options = { chain: args.chain };
  const result = {
    mnemonic: () => validateMnemonic(value, options),
    "private-key": () => validatePrivateKey(value, options),
    wif: () => validateWif(value, options),
    "extended-key": () => validateExtendedKey(value, options),
    any: () => validateWalletKey(value, options)
  }[command]?.();
  if (!result) throw new Error(`unknown command: ${command}`);
  console.log(JSON.stringify(result, null, args.pretty ? 2 : 0));
  process.exit(result.valid ? 0 : 1);
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}
