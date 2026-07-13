package walletkeyvalidatorkit

import "testing"

func TestValidators(t *testing.T) {
	if !ValidatePrivateKey("0000000000000000000000000000000000000000000000000000000000000001", "ethereum").Valid { t.Fatal("eth private key") }
	if ValidatePrivateKey("0000000000000000000000000000000000000000000000000000000000000000", "bitcoin").Valid { t.Fatal("zero key") }
	if !ValidatePrivateKey("0000000000000000000000000000000000000000000000000000000000000000", "solana").Valid { t.Fatal("solana length") }
	if !ValidateWif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn", "bitcoin").Valid { t.Fatal("wif") }
	if ValidateWif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWu", "bitcoin").Valid { t.Fatal("bad wif") }
	if !ValidateExtendedKey("zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs").Valid { t.Fatal("zpub") }
}
