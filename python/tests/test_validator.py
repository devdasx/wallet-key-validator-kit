import unittest
from wallet_key_validator_kit import validate_private_key, validate_wif, validate_extended_key


class KeyValidatorTests(unittest.TestCase):
    def test_private_key(self):
        self.assertTrue(validate_private_key("0" * 63 + "1", "ethereum")["valid"])
        self.assertFalse(validate_private_key("0" * 64, "bitcoin")["valid"])
        self.assertTrue(validate_private_key("0" * 64, "solana")["valid"])

    def test_wif_and_extended(self):
        self.assertTrue(validate_wif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn", "bitcoin")["valid"])
        self.assertFalse(validate_wif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWu", "bitcoin")["valid"])
        self.assertTrue(validate_extended_key("zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs")["valid"])


if __name__ == "__main__":
    unittest.main()
