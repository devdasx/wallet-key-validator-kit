import XCTest
@testable import WalletKeyValidatorKit

final class WalletKeyValidatorKitTests: XCTestCase {
    func testValidators() {
        XCTAssertTrue(WalletKeyValidatorKit.validatePrivateKey("0000000000000000000000000000000000000000000000000000000000000001", chain: "ethereum").valid)
        XCTAssertFalse(WalletKeyValidatorKit.validatePrivateKey("0000000000000000000000000000000000000000000000000000000000000000", chain: "bitcoin").valid)
        XCTAssertTrue(WalletKeyValidatorKit.validatePrivateKey("0000000000000000000000000000000000000000000000000000000000000000", chain: "solana").valid)
        XCTAssertTrue(WalletKeyValidatorKit.validateWif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn", chain: "bitcoin").valid)
        XCTAssertFalse(WalletKeyValidatorKit.validateWif("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWu", chain: "bitcoin").valid)
        XCTAssertTrue(WalletKeyValidatorKit.validateExtendedKey("zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs").valid)
    }
}
