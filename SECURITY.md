# Security Policy

## Supported versions

This is a template that you clone and own, so only the latest state of the default branch is supported. Fixes land there; there are no back-ported release lines. If you started a project from an older clone, compare it with the default branch to pick up a fix.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub: open this repository's **Security** tab, choose **Report a vulnerability**, and fill in the form. The direct link is <https://github.com/volo-uti/electron-boilerplate/security/advisories/new>.

Please include:

- what the problem is and where it is (file, package or script)
- the steps to reproduce it, or a minimal proof of concept
- the impact you expect (what an attacker gains)
- the versions you tested: the commit of this repository, Node and pnpm

## What to expect

- We acknowledge your report within 7 days.
- We then confirm whether we can reproduce it and tell you what we plan to do, and we keep you updated until it is resolved.
- We fix confirmed issues on the default branch and publish a GitHub security advisory. We credit you in the advisory unless you prefer otherwise.
- Please keep the details private until the advisory is published, so people who cloned the template can update first.

## Scope

In scope: the code, scripts and workflows in this repository, including the app's security defaults (sandbox, context isolation, the IPC contract and its checks, the `app://` protocol and Content-Security-Policy, the fuses).

Out of scope: vulnerabilities in third-party dependencies (report them to the maintainers of that package; if this template pins an affected version, tell us), and projects that were created from this template.

Reports about conduct are handled the same way; see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
