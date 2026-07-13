# CLI example

Run from this folder:

```bash
sh run.sh
```

Direct commands:

```bash
walletkeycheck mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
walletkeycheck private-key 0000000000000000000000000000000000000000000000000000000000000001 --chain ethereum --pretty
walletkeycheck wif KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn --chain bitcoin --pretty
walletkeycheck extended-key "zpub..." --chain bitcoin --pretty
walletkeycheck any "zpub..." --chain bitcoin --pretty
walletkeycheck list-chains --pretty
```
