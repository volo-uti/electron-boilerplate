# Releasing

Tests run on your own machine; so do most builds. `pnpm release` on a Mac builds the macOS installers there and the Linux installers in Docker, and uploads both to a draft GitHub release. Pushing the version tag then starts one GitHub Actions job on a Windows runner, which adds the Windows installer to the same draft. You publish the draft by hand.

Only the Windows build runs remotely, because a Windows installer has to be built on Windows. macOS runners cost several times more per minute and would also bill the wait for Apple's notarization, so macOS is built where the signing certificate already is.

## Requirements

- macOS with Xcode command line tools, Docker, and the toolchain from `pnpm install`.
- A clean working tree and a new `version` in `package.json` (committed and pushed). The tag is `v<version>`.
- An `origin` remote on github.com (or `GITHUB_REPOSITORY=owner/name` when origin uses an SSH alias).

## What `pnpm release` does

1. Runs `pnpm check`.
2. `electron-forge make --arch arm64,x64`: a DMG and a zip for each Mac architecture, signed and notarized when the Apple values below are set.
3. `docker build --target linux-out`: runs the gate again in a clean container, then makes deb and rpm packages and a zip for x64 and arm64 into `out/`.
4. `electron-forge release --from-make`: creates the draft release `v<version>` (or reuses it) and uploads every installer.
5. Tags `v<version>` and pushes the tag. `.github/workflows/release-windows.yml` builds the Squirrel installer and uploads it to the same draft.

To build without uploading, run the steps by hand: `pnpm exec electron-forge make --arch arm64,x64` and `docker build --target linux-out --build-arg NODE_VERSION=$(cat .nvmrc) --output type=local,dest=out .`. The installers land in `out/make/`.

## Environment variables

Set them in your shell or a gitignored file you source. Never commit values.

| Name                 | Used for                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`       | Required. A token that can write this repository's contents (creates and fills the release) |
| `ASC_KEY_ID`         | App Store Connect API key id; with the next two, turns on macOS signing and notarization    |
| `ASC_ISSUER_ID`      | App Store Connect issuer id                                                                 |
| `ASC_KEY_CONTENT`    | Contents of the `.p8` key file                                                              |
| `SLACK_BOT_TOKEN`    | Slack bot token with the `chat:write` scope (optional)                                      |
| `SLACK_CICD_CHANNEL` | Channel id the bot posts to (optional)                                                      |

macOS signing uses the "Developer ID Application" certificate in your keychain. Without the three `ASC_*` values the macOS build is unsigned: it runs on your machine, but Gatekeeper blocks it elsewhere and auto-update does not work.

The Windows job uses the repository's `GITHUB_TOKEN` and, for Slack, the `SLACK_BOT_TOKEN` secret and the `SLACK_CICD_CHANNEL` variable. Without them the notification is skipped.

## Windows signing

Without signing, SmartScreen warns on the installer's first launch. Windows only trusts certificates whose key sits in hardware or a cloud signing service: Azure Artifact Signing (open to organizations in a few countries), or a certificate from a provider that signs in the cloud. Both sign through `signtool.exe`, and `forge.config.ts` turns signing on for the app and the Squirrel installer when these values reach the Windows job:

| Name                       | Kind     | Used for                                                                                                |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `WINDOWS_SIGN_PARAMS`      | secret   | The `signtool sign` parameters your provider documents (for Azure: `/dlib <dll> /dmdf <metadata.json>`) |
| `WINDOWS_TIMESTAMP_SERVER` | variable | Your provider's timestamp URL                                                                           |
| `SIGNTOOL_PATH`            | variable | Path to `signtool.exe` when the provider needs a specific one                                           |

Add the step that installs your provider's client and passes its own credentials where `.github/workflows/release-windows.yml` says `SIGN:`. Paths must not contain spaces.

## Slack

Create a Slack app with the `chat:write` scope, install it, invite the bot to the channel and set the two values. `pnpm release` posts when it starts, finishes or fails; the Windows job posts its own start and result. If either value is missing nothing is sent, and a failed message only prints a warning.

## Before the first real release

The release path has not been run against a real repository from the template. Do one pass first: make the installers without uploading, install each one, then release a pre-release version and check that the draft holds the macOS, Linux and Windows files before you publish it.
