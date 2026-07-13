import 'package:crypto/crypto.dart';

const _alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const _secpOrder = 'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141';
const _wif = {'bitcoin': 0x80, 'testnet': 0xef, 'litecoin': 0xb0, 'dogecoin': 0x9e, 'dash': 0xcc, 'bitcoin-cash': 0x80, 'zcash': 0x80, 'digibyte': 0x80};
const _ext = {'0488b21e': 'xpub', '0488ade4': 'xprv', '049d7cb2': 'ypub', '049d7878': 'yprv', '04b24746': 'zpub', '04b2430c': 'zprv', '043587cf': 'tpub', '04358394': 'tprv', '044a5262': 'upub', '044a4e28': 'uprv', '045f1cf6': 'vpub', '045f18bc': 'vprv', '019da462': 'Ltub', '019d9cfe': 'Ltpv', '01b26ef6': 'Mtub', '01b26792': 'Mtpv'};

Map<String, Object?> validatePrivateKey(String value, {String chain = 'bitcoin'}) {
  final body = (value.startsWith('0x') || value.startsWith('0X')) ? value.substring(2) : value;
  if (chain == 'solana') return {'valid': RegExp(r'^([0-9a-fA-F]{64}|[0-9a-fA-F]{128})$').hasMatch(body), 'format': 'ed25519-hex'};
  final valid = RegExp(r'^[0-9a-fA-F]{64}$').hasMatch(body) && body.contains(RegExp(r'[1-9a-fA-F]')) && body.toLowerCase().compareTo(_secpOrder) < 0;
  return {'valid': valid, 'format': 'secp256k1-hex'};
}

Map<String, Object?> validateWif(String value, {String chain = 'bitcoin'}) {
  final payload = _base58Check(value.trim());
  if (payload == null) return {'valid': false, 'format': 'wif', 'reason': 'bad checksum'};
  final compressed = payload.length == 34 && payload.last == 1;
  return {'valid': payload.first == _wif[chain] && (payload.length == 33 || compressed), 'format': 'wif', 'compressed': compressed};
}

Map<String, Object?> validateExtendedKey(String value) {
  final payload = _base58Check(value.trim());
  if (payload == null || payload.length != 78) return {'valid': false, 'format': 'extended-key'};
  final version = payload.take(4).map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  return {'valid': _ext.containsKey(version), 'format': 'extended-key', 'prefix': _ext[version]};
}

List<int>? _base58Decode(String value) {
  var bytes = <int>[0];
  for (final unit in value.runes) {
    final digit = _alphabet.indexOf(String.fromCharCode(unit));
    if (digit < 0) return null;
    var carry = digit;
    for (var i = bytes.length - 1; i >= 0; i--) { final n = bytes[i] * 58 + carry; bytes[i] = n & 0xff; carry = n >> 8; }
    while (carry > 0) { bytes.insert(0, carry & 0xff); carry >>= 8; }
  }
  final zeros = value.runes.takeWhile((r) => r == '1'.codeUnitAt(0)).length;
  return [...List<int>.filled(zeros, 0), ...bytes.skipWhile((b) => b == 0)];
}

List<int>? _base58Check(String value) {
  final raw = _base58Decode(value);
  if (raw == null || raw.length < 5) return null;
  final payload = raw.sublist(0, raw.length - 4);
  final checksum = raw.sublist(raw.length - 4);
  final second = sha256.convert(sha256.convert(payload).bytes).bytes;
  for (var i = 0; i < 4; i++) { if (second[i] != checksum[i]) return null; }
  return payload;
}
