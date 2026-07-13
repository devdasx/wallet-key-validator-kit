package com.devdasx.walletkeyvalidatorkit

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class WalletKeyValidatorKitTest {
    @Test fun validatesKeys() {
        assertTrue(WalletKeyValidatorKit.validatePrivateKey("0000000000000000000000000000000000000000000000000000000000000001", "ethereum").valid)
        assertFalse(WalletKeyValidatorKit.validatePrivateKey("0000000000000000000000000000000000000000000000000000000000000000", "bitcoin").valid)
        assertTrue(WalletKeyValidatorKit.validatePrivateKey("0000000000000000000000000000000000000000000000000000000000000000", "solana").valid)
        assertTrue(WalletKeyValidatorKit.validateWif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn", "bitcoin").valid)
        assertFalse(WalletKeyValidatorKit.validateWif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWu", "bitcoin").valid)
        assertTrue(WalletKeyValidatorKit.validateExtendedKey("zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs").valid)
    }
}
