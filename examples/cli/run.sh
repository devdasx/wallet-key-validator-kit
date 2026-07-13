#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"

MNEMONIC="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
PRIVATE_KEY="0000000000000000000000000000000000000000000000000000000000000001"
BITCOIN_WIF="KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn"
BITCOIN_ZPUB="zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs"

node "$ROOT/bin/walletkeycheck.js" mnemonic "$MNEMONIC" | grep -q '"valid":true'
node "$ROOT/bin/walletkeycheck.js" private-key "$PRIVATE_KEY" --chain ethereum | grep -q '"valid":true'
node "$ROOT/bin/walletkeycheck.js" wif "$BITCOIN_WIF" --chain bitcoin | grep -q '"valid":true'
node "$ROOT/bin/walletkeycheck.js" extended-key "$BITCOIN_ZPUB" --chain bitcoin | grep -q '"valid":true'
node "$ROOT/bin/walletkeycheck.js" any "$BITCOIN_ZPUB" --chain bitcoin | grep -q '"detected":"extended-key"'

echo "cli-example-ok"
