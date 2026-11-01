import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { PublisherGitHub } from "@electron-forge/publisher-github";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Signing and publishing switch on only when their environment values are set (docs/release.md),
// so `pnpm build` works on any machine without credentials.
const { ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH, GITHUB_REPOSITORY = "" } = process.env;
const { WINDOWS_SIGN_PARAMS, SIGNTOOL_PATH } = process.env;
const notarize = ASC_KEY_ID && ASC_ISSUER_ID && ASC_KEY_PATH;

// Windows: signtool with the signing provider's parameters (Azure Artifact Signing or a cloud HSM);
// the timestamp server comes from WINDOWS_TIMESTAMP_SERVER.
type WindowsSign = Exclude<
  NonNullable<ForgeConfig["packagerConfig"]>["windowsSign"],
  true | undefined
>;
const windowsSign: WindowsSign | undefined = WINDOWS_SIGN_PARAMS
  ? {
      signWithParams: WINDOWS_SIGN_PARAMS,
      hashes: ["sha256" as NonNullable<WindowsSign["hashes"]>[number]],
      ...(SIGNTOOL_PATH && { signToolPath: SIGNTOOL_PATH }),
    }
  : undefined;
const [owner, name] = GITHUB_REPOSITORY.split("/");
const pkg = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")) as {
  name: string;
};

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // The Linux installers look for an executable named after the package.
    executableName: pkg.name,
    appBundleId: "io.example.electron-boilerplate",
    // macOS: sign with the Developer ID certificate in the keychain, then notarize with an App Store Connect API key.
    ...(notarize && {
      osxSign: {},
      osxNotarize: {
        appleApiKey: ASC_KEY_PATH,
        appleApiKeyId: ASC_KEY_ID,
        appleApiIssuer: ASC_ISSUER_ID,
      },
    }),
    ...(windowsSign && { windowsSign }),
  },
  makers: [
    new MakerDMG({}),
    // macOS auto-update downloads the zip; on Linux it is the portable build next to the deb.
    new MakerZIP({}, ["darwin", "linux"]),
    new MakerSquirrel({ ...(windowsSign && { windowsSign }) }),
    new MakerDeb({}),
    new MakerRpm({
      options: {
        // @ts-expect-error - Forge's types miss electron-installer-redhat's specTemplate option
        specTemplate: fileURLToPath(new URL("packaging/rpm.spec.ejs", import.meta.url)),
      },
    }),
  ],
  publishers:
    owner && name ? [new PublisherGitHub({ repository: { owner, name }, draft: true })] : [],
  plugins: [
    new VitePlugin({
      build: [
        { entry: { main: "src/main/index.ts" }, config: "vite.main.config.ts", target: "main" },
        {
          entry: { preload: "src/preload/index.ts" },
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [{ name: "main_window", config: "vite.renderer.config.ts" }],
    }),
    // Flipped in the packaged binary before signing; see the Electron fuses guide.
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
      [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,
    }),
  ],
};

export default config;
