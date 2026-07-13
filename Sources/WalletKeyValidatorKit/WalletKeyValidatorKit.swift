import Foundation
import CryptoKit

public struct KeyValidationResult: Equatable {
    public let valid: Bool
    public let format: String?
    public let prefix: String?
    public let reason: String?
}

public enum WalletKeyValidatorKit {
    private static let alphabet = Array("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
    private static let secpOrder = "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"
    private static let wif: [String: UInt8] = ["bitcoin": 0x80, "testnet": 0xef, "litecoin": 0xb0, "dogecoin": 0x9e, "dash": 0xcc, "bitcoin-cash": 0x80, "zcash": 0x80, "digibyte": 0x80]
    private static let ext: [String: String] = ["0488b21e": "xpub", "0488ade4": "xprv", "049d7cb2": "ypub", "049d7878": "yprv", "04b24746": "zpub", "04b2430c": "zprv", "043587cf": "tpub", "04358394": "tprv", "044a5262": "upub", "044a4e28": "uprv", "045f1cf6": "vpub", "045f18bc": "vprv", "019da462": "Ltub", "019d9cfe": "Ltpv", "01b26ef6": "Mtub", "01b26792": "Mtpv"]

    public static func validatePrivateKey(_ value: String, chain: String = "bitcoin") -> KeyValidationResult {
        let body = value.hasPrefix("0x") || value.hasPrefix("0X") ? String(value.dropFirst(2)) : value
        if chain == "solana" {
            let valid = (body.count == 64 || body.count == 128) && body.allSatisfy(\.isHexDigit)
            return KeyValidationResult(valid: valid, format: "ed25519-hex", prefix: nil, reason: nil)
        }
        let valid = body.count == 64 && body.allSatisfy(\.isHexDigit) && body.contains(where: { $0 != "0" }) && body.lowercased() < secpOrder
        return KeyValidationResult(valid: valid, format: "secp256k1-hex", prefix: nil, reason: nil)
    }

    public static func validateWif(_ value: String, chain: String = "bitcoin") -> KeyValidationResult {
        guard let payload = base58Check(value.trimmingCharacters(in: .whitespacesAndNewlines)) else {
            return KeyValidationResult(valid: false, format: "wif", prefix: nil, reason: "bad checksum")
        }
        let compressed = payload.count == 34 && payload.last == 1
        let valid = wif[chain].map { payload.first == $0 && (payload.count == 33 || compressed) } ?? false
        return KeyValidationResult(valid: valid, format: "wif", prefix: nil, reason: nil)
    }

    public static func validateExtendedKey(_ value: String) -> KeyValidationResult {
        guard let payload = base58Check(value.trimmingCharacters(in: .whitespacesAndNewlines)), payload.count == 78 else {
            return KeyValidationResult(valid: false, format: "extended-key", prefix: nil, reason: "invalid extended key")
        }
        let version = payload.prefix(4).map { String(format: "%02x", $0) }.joined()
        let prefix = ext[version]
        return KeyValidationResult(valid: prefix != nil, format: "extended-key", prefix: prefix, reason: nil)
    }

    private static func base58Decode(_ value: String) -> [UInt8]? {
        var bytes: [UInt8] = [0]
        for character in value {
            guard let digit = alphabet.firstIndex(of: character) else { return nil }
            var carry = digit
            for index in stride(from: bytes.count - 1, through: 0, by: -1) {
                let n = Int(bytes[index]) * 58 + carry
                bytes[index] = UInt8(n & 0xff)
                carry = n >> 8
            }
            while carry > 0 { bytes.insert(UInt8(carry & 0xff), at: 0); carry >>= 8 }
        }
        return Array(repeating: 0, count: value.prefix(while: { $0 == "1" }).count) + Array(bytes.drop(while: { $0 == 0 }))
    }

    private static func base58Check(_ value: String) -> [UInt8]? {
        guard let raw = base58Decode(value), raw.count >= 5 else { return nil }
        let payload = Array(raw.dropLast(4))
        let checksum = Array(raw.suffix(4))
        let first = SHA256.hash(data: Data(payload))
        let second = SHA256.hash(data: Data(first))
        return Array(second.prefix(4)) == checksum ? payload : nil
    }
}
