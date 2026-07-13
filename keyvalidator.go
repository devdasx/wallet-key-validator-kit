package walletkeyvalidatorkit

import (
	"crypto/sha256"
	"math/big"
	"regexp"
	"strings"
)

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
var secpOrder, _ = new(big.Int).SetString("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16)
var hex64 = regexp.MustCompile(`^(0x)?[0-9a-fA-F]{64}$`)
var hex64or128 = regexp.MustCompile(`^(0x)?([0-9a-fA-F]{64}|[0-9a-fA-F]{128})$`)
var wifPrefixes = map[string]byte{"bitcoin": 0x80, "testnet": 0xef, "litecoin": 0xb0, "dogecoin": 0x9e, "dash": 0xcc, "bitcoin-cash": 0x80, "zcash": 0x80, "digibyte": 0x80}
var extVersions = map[string]string{"0488b21e": "xpub", "0488ade4": "xprv", "049d7cb2": "ypub", "049d7878": "yprv", "04b24746": "zpub", "04b2430c": "zprv", "043587cf": "tpub", "04358394": "tprv", "044a5262": "upub", "044a4e28": "uprv", "045f1cf6": "vpub", "045f18bc": "vprv", "019da462": "Ltub", "019d9cfe": "Ltpv", "01b26ef6": "Mtub", "01b26792": "Mtpv"}

type Result struct { Valid bool; Chain string; Format string; Prefix string; Compressed bool; Reason string }

func b58decode(value string) ([]byte, bool) {
	n := big.NewInt(0); radix := big.NewInt(58)
	for _, r := range value { i := strings.IndexRune(alphabet, r); if i < 0 { return nil, false }; n.Mul(n, radix); n.Add(n, big.NewInt(int64(i))) }
	out := n.Bytes(); zeros := 0
	for zeros < len(value) && value[zeros] == '1' { zeros++ }
	return append(make([]byte, zeros), out...), true
}

func b58check(value string) ([]byte, bool) {
	raw, ok := b58decode(value); if !ok || len(raw) < 5 { return nil, false }
	payload, checksum := raw[:len(raw)-4], raw[len(raw)-4:]
	a := sha256.Sum256(payload); b := sha256.Sum256(a[:])
	for i := 0; i < 4; i++ { if b[i] != checksum[i] { return nil, false } }
	return payload, true
}

func ValidatePrivateKey(value, chain string) Result {
	text := strings.TrimPrefix(strings.TrimPrefix(value, "0x"), "0X")
	if chain == "solana" { return Result{Valid: hex64or128.MatchString(text), Chain: chain, Format: "ed25519-hex"} }
	if !hex64.MatchString(text) { return Result{Valid: false, Chain: chain, Reason: "private key must be 32-byte hex"} }
	n, _ := new(big.Int).SetString(text, 16)
	return Result{Valid: n.Sign() > 0 && n.Cmp(secpOrder) < 0, Chain: chain, Format: "secp256k1-hex"}
}

func ValidateWif(value, chain string) Result {
	payload, ok := b58check(strings.TrimSpace(value)); if !ok { return Result{Valid: false, Chain: chain, Reason: "bad checksum"} }
	prefix, has := wifPrefixes[chain]
	compressed := len(payload) == 34 && payload[33] == 1
	return Result{Valid: has && payload[0] == prefix && (len(payload) == 33 || compressed), Chain: chain, Format: "wif", Compressed: compressed}
}

func ValidateExtendedKey(value string) Result {
	payload, ok := b58check(strings.TrimSpace(value)); if !ok || len(payload) != 78 { return Result{Valid: false, Reason: "invalid extended key"} }
	prefix := extVersions[toHex(payload[:4])]
	return Result{Valid: prefix != "", Format: "extended-key", Prefix: prefix}
}

func toHex(bytes []byte) string { const h = "0123456789abcdef"; out := make([]byte, len(bytes)*2); for i,b := range bytes { out[i*2] = h[b>>4]; out[i*2+1] = h[b&15] }; return string(out) }
