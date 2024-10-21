## [1.14.2](https://github.com/liveryvideo/interactive-bridge/compare/v1.14.1...v1.14.2) (2024-10-21)


### Bug Fixes

* add support for last 3 (not 2) versions of iOS (i.e: currently v16) ([d78e705](https://github.com/liveryvideo/interactive-bridge/commit/d78e7054b3d4cfe4f402dac16351c50a9d64d709))

## [1.14.1](https://github.com/liveryvideo/interactive-bridge/compare/v1.14.0...v1.14.1) (2024-10-18)


### Bug Fixes

* **validateAuthClaims:** add custom1..5 string properties here as well ([3ed5973](https://github.com/liveryvideo/interactive-bridge/commit/3ed59733e262c46d0c0c6ff23da2c80c932b7b0d))

# [1.14.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.13.5...v1.14.0) (2024-10-18)


### Features

* add custom1..5 string properties to AuthClaims and export validateAuthClaims ([#34](https://github.com/liveryvideo/interactive-bridge/issues/34)) ([0ef6084](https://github.com/liveryvideo/interactive-bridge/commit/0ef6084e9df9f6835c7deafd658c8a9323eeb890))

## [1.13.5](https://github.com/liveryvideo/interactive-bridge/compare/v1.13.4...v1.13.5) (2024-10-14)


### Bug Fixes

* use @liveryvideo/biome-lit, fix lint errors, update configs and most* dependencies ([5761c98](https://github.com/liveryvideo/interactive-bridge/commit/5761c9889b50f55023bef3197a9e9fb97b34bb36))

## [1.13.4](https://github.com/liveryvideo/interactive-bridge/compare/v1.13.3...v1.13.4) (2024-03-15)


### Bug Fixes

* don't flash default controls when using custom interactive player controls ([#33](https://github.com/liveryvideo/interactive-bridge/issues/33)) ([275141f](https://github.com/liveryvideo/interactive-bridge/commit/275141f2c1838a18a63ef5f4064282a389e61129))

## [1.13.3](https://github.com/liveryvideo/interactive-bridge/compare/v1.13.2...v1.13.3) (2024-03-08)


### Bug Fixes

* **livery-bridge-interactive:** remove test string from interactive auth value ([90529b5](https://github.com/liveryvideo/interactive-bridge/commit/90529b572627bf5d2fcf6584b31a54e8ad48eea1))

## [1.13.2](https://github.com/liveryvideo/interactive-bridge/compare/v1.13.1...v1.13.2) (2024-03-08)


### Bug Fixes

* **livery-bridge-interactive:** show interactive auth value as pre-formatted text ([f643e84](https://github.com/liveryvideo/interactive-bridge/commit/f643e84ce3d22bb06b288c286fed9c0fcce51fef))

## [1.13.1](https://github.com/liveryvideo/interactive-bridge/compare/v1.13.0...v1.13.1) (2024-03-08)


### Bug Fixes

* **livery-bridge-interactive:** show interactive auth value ([44ae984](https://github.com/liveryvideo/interactive-bridge/commit/44ae984625711997522ba463da4cdcc135ea3d42))

# [1.13.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.12.6...v1.13.0) (2024-03-08)


### Features

* **InteractiveBridge:** add handleAuth callback option ([#32](https://github.com/liveryvideo/interactive-bridge/issues/32)) ([4b377c2](https://github.com/liveryvideo/interactive-bridge/commit/4b377c227339e42f613b5cacdfa0910fdaf3fa2e))

## [1.12.6](https://github.com/liveryvideo/interactive-bridge/compare/v1.12.5...v1.12.6) (2024-02-29)


### Bug Fixes

* add volume to features registry and note it as required for setVolume ([c61d8e6](https://github.com/liveryvideo/interactive-bridge/commit/c61d8e6e69539f209d274ee5b754eae15f339b0f))
* **MockPlayerBridge:** add volume to features here as well ([095c9f6](https://github.com/liveryvideo/interactive-bridge/commit/095c9f6a973c556fbd2503fd85a91903c0d0a3e0))

## [1.12.5](https://github.com/liveryvideo/interactive-bridge/compare/v1.12.4...v1.12.5) (2024-02-27)


### Bug Fixes

* make config and qualities values consistently required ([#31](https://github.com/liveryvideo/interactive-bridge/issues/31)) ([a6da5ed](https://github.com/liveryvideo/interactive-bridge/commit/a6da5ed39e24db84708c57ddb0f00c47f1de0d90))

## [1.12.4](https://github.com/liveryvideo/interactive-bridge/compare/v1.12.3...v1.12.4) (2024-02-26)


### Bug Fixes

* **docs:** update to new InteractiveBridge target and typedoc usage ([a4ac700](https://github.com/liveryvideo/interactive-bridge/commit/a4ac700353fd19a7703a0c4d3e64e27f9394ec87))

## [1.12.3](https://github.com/liveryvideo/interactive-bridge/compare/v1.12.2...v1.12.3) (2024-02-26)


### Bug Fixes

* replace use of tsdocs.dev by typedoc generated markdown ([#30](https://github.com/liveryvideo/interactive-bridge/issues/30)) ([912924f](https://github.com/liveryvideo/interactive-bridge/commit/912924fd6c2e7e74f946b8a19bb4bfec9c0d4a9c))

## [1.12.2](https://github.com/liveryvideo/interactive-bridge/compare/v1.12.1...v1.12.2) (2024-02-13)


### Bug Fixes

* **InteractiveBridge:** update tsdoc: getPlayback and subscribeMode don't require features scrubber ([f24c00c](https://github.com/liveryvideo/interactive-bridge/commit/f24c00cc2210b1518295b3633371b90516837afa))

## [1.12.1](https://github.com/liveryvideo/interactive-bridge/compare/v1.12.0...v1.12.1) (2024-02-13)


### Bug Fixes

* export Volume type ([db6e8f7](https://github.com/liveryvideo/interactive-bridge/commit/db6e8f78b1f7a97ad9ff0304396aa84bd433ff29))

# [1.12.0](https://github.com/liveryvideo/interactive-bridge/compare/v1.11.5...v1.12.0) (2024-02-13)


### Features

* add setVolume command and replace subscribeMuted by subscribeVolume ([#29](https://github.com/liveryvideo/interactive-bridge/issues/29)) ([f9747df](https://github.com/liveryvideo/interactive-bridge/commit/f9747df460ccced5bafca043eb287a30e7f77017))

## [1.11.5](https://github.com/liveryvideo/interactive-bridge/compare/v1.11.4...v1.11.5) (2024-02-09)


### Bug Fixes

* allow NaN values in PlaybackDetails, replace zod-validation-error by own ([5f2dda9](https://github.com/liveryvideo/interactive-bridge/commit/5f2dda99f76bc739f268c00993ba51dbe629c0cb))

## [1.11.4](https://github.com/liveryvideo/interactive-bridge/compare/v1.11.3...v1.11.4) (2024-02-09)


### Bug Fixes

* use zod-validation-error to produce human readable errors ([e54ae9d](https://github.com/liveryvideo/interactive-bridge/commit/e54ae9dec513298529053a565ce007f664b1f853))

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
