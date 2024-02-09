## [1.11.3](https://github.com/liveryvideo/interactive-bridge/compare/v1.11.2...v1.11.3) (2024-02-09)


### Bug Fixes

* change streamPhases type to array of tuples, use humanStringify ([#28](https://github.com/liveryvideo/interactive-bridge/issues/28)) ([58c51fe](https://github.com/liveryvideo/interactive-bridge/commit/58c51fe9f1d581035ff4d82a4c3438e6a4d00cbf))

## [1.11.2](https://github.com/liveryvideo/interactive-bridge/compare/v1.11.1...v1.11.2) (2024-02-09)


### Bug Fixes

* typo in the subscribeStalled reducer ([#27](https://github.com/liveryvideo/interactive-bridge/issues/27)) ([4b3d61b](https://github.com/liveryvideo/interactive-bridge/commit/4b3d61bf38b652a1b50bd9da9b589da3859131c8))

## [1.11.1](https://github.com/liveryvideo/interactive-bridge/compare/v1.11.0...v1.11.1) (2024-02-05)


### Bug Fixes

* keys of Config.streamPhases are string not number ([d4262a9](https://github.com/liveryvideo/interactive-bridge/commit/d4262a93740cd501cfa21b4d3c808aaf62cb71f4))

# [1.11.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.10.0...v1.11.0) (2024-02-05)


### Features

* **interactive-bridge:** add interactive player controls support ([#25](https://github.com/liveryvideo/interactive-bridge/issues/25)) ([f07e911](https://github.com/liveryvideo/interactive-bridge/commit/f07e9115e736a6072e9fe693bea63a22414c550a))

# [1.10.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.9.3...v1.10.0) (2024-01-29)


### Features

* update dependencies (Lit v3, etc) ([#26](https://github.com/liveryvideo/interactive-bridge/issues/26)) ([f5ecd8f](https://github.com/liveryvideo/interactive-bridge/commit/f5ecd8f41f0d12903c43e7bea22a311c47d8e386))

## [1.9.3](https://github.com/liveryvideo/interactive-bridge/compare/v1.9.2...v1.9.3) (2024-01-29)


### Bug Fixes

* **docs:** fix and improve documentation for use from tsdocs.dev ([69c608b](https://github.com/liveryvideo/interactive-bridge/commit/69c608b1bd990eb8ef742e86b44fe949813137c7))

## [1.9.2](https://github.com/liveryvideo/interactive-bridge/compare/v1.9.1...v1.9.2) (2023-10-12)


### Bug Fixes

* support loading interactive-bridge multiple times ([#24](https://github.com/liveryvideo/interactive-bridge/issues/24)) ([30b0bb4](https://github.com/liveryvideo/interactive-bridge/commit/30b0bb476dd54712bbdd5df0cc9f92c9f9db3a33))

## [1.9.1](https://github.com/liveryvideo/interactive-bridge/compare/v1.9.0...v1.9.1) (2023-10-05)


### Bug Fixes

* update lit v2.8.0 and browsers list ([004451a](https://github.com/liveryvideo/interactive-bridge/commit/004451a52b1ae1427afa10e5e6235ebd5289a6e4))

# [1.9.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.8.3...v1.9.0) (2023-08-03)


### Features

* **livery-bridge-element:** add support for region and tenantId ([#23](https://github.com/liveryvideo/interactive-bridge/issues/23)) ([1ffb945](https://github.com/liveryvideo/interactive-bridge/commit/1ffb94537d98374ef81dad947ac4d52d394d1aa7))

## [1.8.3](https://github.com/liveryvideo/interactive-bridge/compare/v1.8.2...v1.8.3) (2023-07-21)


### Bug Fixes

* rename LiveryInteractive to LiveryBridgeInteractive to avoid conflicts ([a4de0d4](https://github.com/liveryvideo/interactive-bridge/commit/a4de0d49e79d1a9fdc3f422df2fce42e61fe2c5f))

## [1.8.2](https://github.com/liveryvideo/interactive-bridge/compare/v1.8.1...v1.8.2) (2023-07-21)


### Bug Fixes

* add direct bridge support to LiveryBridgeLog and add LiveryInteractive and LiveryBridgeMock elements ([#22](https://github.com/liveryvideo/interactive-bridge/issues/22)) ([a98d64b](https://github.com/liveryvideo/interactive-bridge/commit/a98d64ba9fdd46458496a0119705de52b645fe3b))

## [1.8.1](https://github.com/liveryvideo/interactive-bridge/compare/v1.8.0...v1.8.1) (2023-07-14)


### Bug Fixes

* **AbstractPlayerBridge:** make subscribeFullscreen() abstract and update subscribeOrientation ([5b226f5](https://github.com/liveryvideo/interactive-bridge/commit/5b226f5cd5b6e2500c161fd822f9e651e5d43983))

# [1.8.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.7.0...v1.8.0) (2023-07-14)


### Features

* add support for target: AbstractPlayerBridge argument to InteractiveBridge ([#21](https://github.com/liveryvideo/interactive-bridge/issues/21)) ([40e600e](https://github.com/liveryvideo/interactive-bridge/commit/40e600e269460a3c53fad5fc9ef302effee0f15f))

# [1.7.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.6.2...v1.7.0) (2023-04-07)


### Features

* **interactive-bridge:** add 'getLiveryParams' command ([#20](https://github.com/liveryvideo/interactive-bridge/issues/20)) ([9fee27f](https://github.com/liveryvideo/interactive-bridge/commit/9fee27f263740d730ca61b34f93cbef4fc0ab587))

## [1.6.2](https://github.com/liveryvideo/interactive-bridge/compare/v1.6.1...v1.6.2) (2021-12-14)


### Bug Fixes

* have semantic-release publish to npm this time ([0395eff](https://github.com/liveryvideo/interactive-bridge/commit/0395eff550ff93bab4497848a82efe21962b9544))

## [1.6.1](https://github.com/liveryvideo/interactive-bridge/compare/v1.6.0...v1.6.1) (2021-12-14)


### Bug Fixes

* update to TypeScript v4.5.4, lit v2.0.2, @web/dev-server, @web/test-runner, etc. ([7922ccf](https://github.com/liveryvideo/interactive-bridge/commit/7922ccfa45a9be4127928776201bd2bcbf648ee5))

# [1.6.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.5.0...v1.6.0) (2021-10-11)


### Features

* **interactive-bridge:** add support for various analytics values ([#8](https://github.com/liveryvideo/interactive-bridge/issues/8)) ([17fa338](https://github.com/liveryvideo/interactive-bridge/commit/17fa338c8fda3be6b0fec0fc013557e9c727d16d))

# [1.5.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.4.0...v1.5.0) (2021-09-07)


### Features

* move and rename to liveryvideo/interactive-bridge ([c03b3e4](https://github.com/liveryvideo/interactive-bridge/commit/c03b3e4f63adecb7a034d7ef6af0d31e89cac216))

# [1.4.0](https://github.com/exmg/livery-interactive/compare/v1.3.0...v1.4.0) (2021-04-22)


### Features

* **demo:** register default "test" custom interactive command ([4f2ab73](https://github.com/exmg/livery-interactive/commit/4f2ab730855e8e764a6f4fc29cc1a9e290921aac))

# [1.3.0](https://github.com/exmg/livery-interactive/compare/v1.2.2...v1.3.0) (2021-04-15)


### Features

* **interactive-bridge:** add better custom command method names ([ecce00d](https://github.com/exmg/livery-interactive/commit/ecce00de8abb68f1d4e70c1246df4ef549441b8b))

## [1.2.2](https://github.com/exmg/livery-interactive/compare/v1.2.1...v1.2.2) (2021-04-13)


### Bug Fixes

* export Orientation and StreamPhase types ([2e8f47b](https://github.com/exmg/livery-interactive/commit/2e8f47b0dda7df4c7d015b154005f40175b59e20))

## [1.2.1](https://github.com/exmg/livery-interactive/compare/v1.2.0...v1.2.1) (2021-04-13)


### Bug Fixes

* **livery-bridge:** remove setTargetOrigin ([6ff55db](https://github.com/exmg/livery-interactive/commit/6ff55dbd884f4b674634746fbb101539d0b144c8))

# [1.2.0](https://github.com/exmg/livery-interactive/compare/v1.1.2...v1.2.0) (2021-03-31)


### Features

* **livery-bridge:** add setTargetOrigin method ([a836dee](https://github.com/exmg/livery-interactive/commit/a836dee2b356ea9c6d033185bc9392342fec1500))

## [1.1.2](https://github.com/exmg/livery-interactive/compare/v1.1.1...v1.1.2) (2021-03-26)


### Bug Fixes

* **livery-bridge:** fix version check only accepting identical versions ([8588c49](https://github.com/exmg/livery-interactive/commit/8588c49ac0751f7ca4b94be2866c3818cb00daee))

## [1.1.1](https://github.com/exmg/livery-interactive/compare/v1.1.0...v1.1.1) (2021-03-18)


### Bug Fixes

* **livery-bridge-log:** fix text wrapping ([7675996](https://github.com/exmg/livery-interactive/commit/7675996bce22741945f6ba0fe3230d8300de0615))

# [1.1.0](https://github.com/exmg/livery-interactive/compare/v1.0.0...v1.1.0) (2021-03-18)


### Features

* **livery-bridge-log:** add livery-bridge-log element for debugging ([c9eb820](https://github.com/exmg/livery-interactive/commit/c9eb82011e1a74336c30a5cd7a73ae544bc22f27))

# 1.0.0 (2021-03-18)


### Bug Fixes

* **LiveryBridge:** add listener support to handler side ([bc8ad03](https://github.com/exmg/livery-interactive/commit/bc8ad03a7f159520913e4a2424f608c4d74fe4bc))
