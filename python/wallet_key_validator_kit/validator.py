import hashlib
import re

ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
SECP_ORDER = int("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16)
WIF = {"bitcoin": 0x80, "testnet": 0xEF, "litecoin": 0xB0, "dogecoin": 0x9E, "dash": 0xCC, "bitcoin-cash": 0x80, "zcash": 0x80, "digibyte": 0x80}
EXT = {
    "0488b21e": "xpub", "0488ade4": "xprv", "049d7cb2": "ypub", "049d7878": "yprv", "04b24746": "zpub", "04b2430c": "zprv",
    "043587cf": "tpub", "04358394": "tprv", "044a5262": "upub", "044a4e28": "uprv", "045f1cf6": "vpub", "045f18bc": "vprv",
    "019da462": "Ltub", "019d9cfe": "Ltpv", "01b26ef6": "Mtub", "01b26792": "Mtpv",
}


def _b58decode(value: str) -> bytes:
    number = 0
    for char in value:
        if char not in ALPHABET:
            raise ValueError("invalid base58 character")
        number = number * 58 + ALPHABET.index(char)
    raw = number.to_bytes((number.bit_length() + 7) // 8, "big") if number else b""
    return b"\x00" * (len(value) - len(value.lstrip("1"))) + raw


def _b58check(value: str) -> bytes:
    raw = _b58decode(value)
    if len(raw) < 5:
        raise ValueError("too short")
    payload, checksum = raw[:-4], raw[-4:]
    expected = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
    if checksum != expected:
        raise ValueError("bad checksum")
    return payload


def validate_private_key(value: str, chain: str = "bitcoin"):
    text = (value or "").removeprefix("0x").removeprefix("0X")
    if chain == "solana":
        return {"valid": bool(re.fullmatch(r"[0-9a-fA-F]{64}|[0-9a-fA-F]{128}", text)), "chain": chain, "format": "ed25519-hex"}
    if not re.fullmatch(r"[0-9a-fA-F]{64}", text):
        return {"valid": False, "chain": chain, "reason": "private key must be 32-byte hex"}
    n = int(text, 16)
    return {"valid": 0 < n < SECP_ORDER, "chain": chain, "format": "secp256k1-hex"}


def validate_wif(value: str, chain: str = "bitcoin"):
    try:
        payload = _b58check(value.strip())
    except ValueError as exc:
        return {"valid": False, "chain": chain, "reason": str(exc)}
    prefix = WIF.get(chain)
    compressed = len(payload) == 34 and payload[-1] == 1
    valid = prefix is not None and payload[0] == prefix and (len(payload) == 33 or compressed)
    return {"valid": valid, "chain": chain, "format": "wif", "compressed": compressed}


def validate_extended_key(value: str):
    try:
        payload = _b58check(value.strip())
    except ValueError as exc:
        return {"valid": False, "reason": str(exc)}
    version = payload[:4].hex()
    prefix = EXT.get(version)
    return {"valid": len(payload) == 78 and prefix is not None, "format": "extended-key", "prefix": prefix}
