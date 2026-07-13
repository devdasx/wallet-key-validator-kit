// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WalletKeyValidatorKit",
    platforms: [.macOS(.v13), .iOS(.v15)],
    products: [.library(name: "WalletKeyValidatorKit", targets: ["WalletKeyValidatorKit"])],
    targets: [
        .target(name: "WalletKeyValidatorKit"),
        .testTarget(name: "WalletKeyValidatorKitTests", dependencies: ["WalletKeyValidatorKit"])
    ]
)
