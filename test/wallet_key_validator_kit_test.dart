import 'package:test/test.dart';
import 'package:wallet_key_validator_kit/wallet_key_validator_kit.dart';

void main() {
  test('validates keys', () {
    expect(validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000001', chain: 'ethereum')['valid'], true);
    expect(validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000', chain: 'bitcoin')['valid'], false);
    expect(validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000', chain: 'solana')['valid'], true);
    expect(validateWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn', chain: 'bitcoin')['valid'], true);
    expect(validateWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWu', chain: 'bitcoin')['valid'], false);
    expect(validateExtendedKey('zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs')['valid'], true);
  });
}
