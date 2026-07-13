package com.devdasx.walletkeyvalidatorkit

import java.math.BigInteger
import java.security.MessageDigest

data class KeyValidationResult(val valid: Boolean, val format: String? = null, val prefix: String? = null, val reason: String? = null)

object WalletKeyValidatorKit {
    private const val alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    private val secpOrder = BigInteger("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16)
    private val wif = mapOf("bitcoin" to 0x80, "testnet" to 0xef, "litecoin" to 0xb0, "dogecoin" to 0x9e, "dash" to 0xcc, "bitcoin-cash" to 0x80, "zcash" to 0x80, "digibyte" to 0x80)
    private val ext = mapOf("0488b21e" to "xpub", "0488ade4" to "xprv", "049d7cb2" to "ypub", "049d7878" to "yprv", "04b24746" to "zpub", "04b2430c" to "zprv", "043587cf" to "tpub", "04358394" to "tprv", "044a5262" to "upub", "044a4e28" to "uprv", "045f1cf6" to "vpub", "045f18bc" to "vprv", "019da462" to "Ltub", "019d9cfe" to "Ltpv", "01b26ef6" to "Mtub", "01b26792" to "Mtpv")

    fun validatePrivateKey(value: String, chain: String = "bitcoin"): KeyValidationResult {
        val body = if (value.startsWith("0x", true)) value.drop(2) else value
        if (chain == "solana") return KeyValidationResult(Regex("^([0-9a-fA-F]{64}|[0-9a-fA-F]{128})$").matches(body), "ed25519-hex")
        val n = body.toBigIntegerOrNull(16)
        return KeyValidationResult(body.matches(Regex("^[0-9a-fA-F]{64}$")) && n != null && n > BigInteger.ZERO && n < secpOrder, "secp256k1-hex")
    }

    fun validateWif(value: String, chain: String = "bitcoin"): KeyValidationResult {
        val payload = base58Check(value.trim()) ?: return KeyValidationResult(false, "wif", reason = "bad checksum")
        val compressed = payload.size == 34 && payload.last() == 1.toByte()
        return KeyValidationResult(payload.first().toInt() and 0xff == wif[chain] && (payload.size == 33 || compressed), "wif")
    }

    fun validateExtendedKey(value: String): KeyValidationResult {
        val payload = base58Check(value.trim()) ?: return KeyValidationResult(false, "extended-key", reason = "bad checksum")
        val version = payload.take(4).joinToString("") { "%02x".format(it) }
        val prefix = ext[version]
        return KeyValidationResult(payload.size == 78 && prefix != null, "extended-key", prefix)
    }

    private fun base58Decode(value: String): ByteArray? {
        var number = BigInteger.ZERO
        for (char in value) {
            val digit = alphabet.indexOf(char)
            if (digit < 0) return null
            number = number.multiply(BigInteger.valueOf(58)).add(BigInteger.valueOf(digit.toLong()))
        }
        val raw = number.toByteArray().dropWhile { it == 0.toByte() }.toByteArray()
        return ByteArray(value.takeWhile { it == '1' }.length) + raw
    }

    private fun base58Check(value: String): ByteArray? {
        val raw = base58Decode(value) ?: return null
        if (raw.size < 5) return null
        val payload = raw.copyOfRange(0, raw.size - 4)
        val checksum = raw.copyOfRange(raw.size - 4, raw.size)
        val first = MessageDigest.getInstance("SHA-256").digest(payload)
        val second = MessageDigest.getInstance("SHA-256").digest(first)
        return if (second.copyOfRange(0, 4).contentEquals(checksum)) payload else null
    }
}
