# syntax=docker/dockerfile:1
# Stages: base (dependencies) -> check (the gate) -> linux (Linux installers) -> linux-out (just the installers).
# `pnpm verify` builds `check`; `pnpm release` exports `linux-out` into out/ and publishes it with the macOS build.
ARG NODE_VERSION=lts

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV CI=true
# Install the pnpm version pinned by "packageManager" (corepack is not used).
COPY package.json ./
RUN npm install --global "pnpm@$(node -p "require('./package.json').packageManager.split('@')[1]")"
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS check
RUN pnpm check

# The deb maker calls dpkg-deb and fakeroot, the rpm maker rpmbuild, the zip maker zip.
FROM check AS linux
RUN apt-get update \
    && apt-get install --yes --no-install-recommends fakeroot rpm zip \
    && rm -rf /var/lib/apt/lists/*
RUN pnpm exec electron-forge make --platform linux --arch x64,arm64

FROM scratch AS linux-out
COPY --from=linux /app/out/make /make
COPY --from=linux /app/out/make-results /make-results
