use sha2::{Digest, Sha256};

const ALPHABET: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const SECP_ORDER: &str = "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationResult { pub valid: bool, pub format: Option<String>, pub prefix: Option<String>, pub reason: Option<String> }

fn b58decode(value: &str) -> Option<Vec<u8>> {
    let mut out = vec![0u8];
    for byte in value.bytes() {
        let digit = ALPHABET.iter().position(|&x| x == byte)? as u32;
        let mut carry = digit;
        for item in out.iter_mut().rev() { let n = (*item as u32) * 58 + carry; *item = (n & 0xff) as u8; carry = n >> 8; }
        while carry > 0 { out.insert(0, (carry & 0xff) as u8); carry >>= 8; }
    }
    let zeros = value.bytes().take_while(|&b| b == b'1').count();
    let first_nonzero = out.iter().position(|&b| b != 0).unwrap_or(out.len());
    let mut result = vec![0u8; zeros]; result.extend_from_slice(&out[first_nonzero..]); Some(result)
}

fn b58check(value: &str) -> Option<Vec<u8>> {
    let raw = b58decode(value)?; if raw.len() < 5 { return None; }
    let (payload, checksum) = raw.split_at(raw.len() - 4);
    let first = Sha256::digest(payload); let second = Sha256::digest(first);
    if &second[..4] == checksum { Some(payload.to_vec()) } else { None }
}

pub fn validate_private_key(value: &str, chain: &str) -> ValidationResult {
    let body = value.strip_prefix("0x").or_else(|| value.strip_prefix("0X")).unwrap_or(value);
    if chain == "solana" {
        let valid = (body.len() == 64 || body.len() == 128) && body.bytes().all(|b| b.is_ascii_hexdigit());
        return ValidationResult { valid, format: Some("ed25519-hex".into()), prefix: None, reason: None };
    }
    let valid = body.len() == 64 && body.bytes().all(|b| b.is_ascii_hexdigit()) && body.chars().any(|c| c != '0') && body < SECP_ORDER;
    ValidationResult { valid, format: Some("secp256k1-hex".into()), prefix: None, reason: None }
}

pub fn validate_wif(value: &str, chain: &str) -> ValidationResult {
    let Some(payload) = b58check(value.trim()) else { return ValidationResult { valid: false, format: Some("wif".into()), prefix: None, reason: Some("bad checksum".into()) }; };
    let prefix = match chain { "bitcoin" | "bitcoin-cash" | "zcash" | "digibyte" => 0x80, "testnet" => 0xef, "litecoin" => 0xb0, "dogecoin" => 0x9e, "dash" => 0xcc, _ => 0xff };
    let compressed = payload.len() == 34 && payload[33] == 1;
    ValidationResult { valid: payload[0] == prefix && (payload.len() == 33 || compressed), format: Some("wif".into()), prefix: None, reason: None }
}

pub fn validate_extended_key(value: &str) -> ValidationResult {
    let Some(payload) = b58check(value.trim()) else { return ValidationResult { valid: false, format: Some("extended-key".into()), prefix: None, reason: Some("bad checksum".into()) }; };
    let version = hex(&payload[..4]);
    let prefix = match version.as_str() {
        "0488b21e" => "xpub", "0488ade4" => "xprv", "049d7cb2" => "ypub", "049d7878" => "yprv", "04b24746" => "zpub", "04b2430c" => "zprv",
        "043587cf" => "tpub", "04358394" => "tprv", "044a5262" => "upub", "044a4e28" => "uprv", "045f1cf6" => "vpub", "045f18bc" => "vprv",
        "019da462" => "Ltub", "019d9cfe" => "Ltpv", "01b26ef6" => "Mtub", "01b26792" => "Mtpv", _ => ""
    };
    ValidationResult { valid: payload.len() == 78 && !prefix.is_empty(), format: Some("extended-key".into()), prefix: Some(prefix.into()), reason: None }
}

fn hex(bytes: &[u8]) -> String { const H: &[u8] = b"0123456789abcdef"; let mut out = String::new(); for b in bytes { out.push(H[(b >> 4) as usize] as char); out.push(H[(b & 15) as usize] as char); } out }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn validates_keys() {
        assert!(validate_private_key("0000000000000000000000000000000000000000000000000000000000000001", "ethereum").valid);
        assert!(!validate_private_key("0000000000000000000000000000000000000000000000000000000000000000", "bitcoin").valid);
        assert!(validate_private_key("0000000000000000000000000000000000000000000000000000000000000000", "solana").valid);
        assert!(validate_wif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn", "bitcoin").valid);
        assert!(!validate_wif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWu", "bitcoin").valid);
        assert!(validate_extended_key("zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs").valid);
    }
}
