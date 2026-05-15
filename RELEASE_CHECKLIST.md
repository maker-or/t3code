# Release Checklist

Launch target: `polarish`

Use this checklist before shipping a build to users.

## Status key

- `[ ]` Not done
- `[x]` Done

---

## 1. Release gating / go-no-go

### Product and brand

- [x] Final product name is decided and approved.
- [ ] Final public brand is consistent across app, website, docs, and installers.
- [ ] Any rename of the product has a migration plan for links, assets, and update feeds.
- [x] Internal identifiers that are intentionally kept (`T3CODE_*`, `pipper`, package names, etc.) are documented.

### Distribution

- [ ] Latest stable build is created.
- [ ] Latest nightly build is created if nightly channel is used.
- [ ] Release artifacts are uploaded to the correct release location.
- [ ] Release notes are published.
- [ ] Download links on the marketing site match the uploaded artifacts.
- [ ] Auto-update feed is reachable and points to the correct release source.

### User readiness

- [ ] App launches successfully on macOS.
- [ ] App launches successfully on Windows.
- [ ] App launches successfully on Linux.
- [ ] Core login / provider setup flow works.
- [ ] Core chat / editing flow works.
- [ ] Source control features work.
- [ ] No user-facing text still shows the old brand unless intentionally preserved.

---

## 2. Rebranding checklist

### App-visible branding

- [ ] Splash screen uses the final app name and final icon.
- [ ] Update dialogs use the final app name.
- [ ] Error messages visible to users use the final app name.
- [ ] Window title / app display name uses the final brand.
- [ ] About / version / product metadata uses the final brand.
- [ ] Desktop packaging shows the final product name in installers and OS surfaces.

### Marketing branding

- [ ] Homepage headline is updated.
- [ ] Homepage description is updated.
- [ ] Homepage CTA text matches the new brand.
- [ ] Download page title is updated.
- [ ] Download page heading is updated.
- [ ] Download page description is updated.
- [ ] Nav logo / alt text reflects the final brand.
- [ ] Footer copy reflects the final brand / company name.
- [ ] GitHub repo links are correct.
- [ ] Release links are correct.
- [ ] Screenshots / hero images / icons are updated if needed.

### Documentation branding

- [ ] README title is updated.
- [ ] README install instructions are updated.
- [ ] Public docs mention the final brand.
- [ ] Package manager commands are correct.
- [ ] Release announcement text uses the final brand.
- [ ] Support / Discord / community links are correct.

### Internal naming decisions

- [ ] Decide whether internal prefixes stay the same:
  - [ ] `T3CODE_` env vars
  - [ ] `pipper:` storage keys
  - [ ] `pipper` executable name
  - [ ] `com.t3tools.pipper` app ID
  - [ ] `maker-or/pipper` GitHub repo references
- [ ] If any internal name changes, migration / fallback support is implemented.

---

## 3. File-by-file rebrand audit

### App branding

- [ ] `apps/web/src/branding.ts`
  - [ ] Replace default app base name if needed.
  - [ ] Keep injected desktop branding support working.
  - [ ] Confirm stage labels still make sense.
- [ ] `apps/web/src/components/SplashScreen.tsx`
  - [ ] Update aria label.
  - [ ] Update image alt text.
  - [ ] Replace splash asset if needed.
- [ ] `apps/web/src/components/desktopUpdate.logic.ts`
  - [ ] Replace update prompt copy.
  - [ ] Replace Apple Silicon / Rosetta warning copy.
  - [ ] Confirm all user-facing strings use the final brand.

### Desktop packaging

- [ ] `apps/desktop/package.json`
  - [ ] Update `productName`.
  - [ ] Confirm alpha / nightly suffix policy.
- [ ] `scripts/build-desktop-artifact.ts`
  - [ ] Update `productName` resolution if needed.
  - [ ] Confirm `appId` is still correct.
  - [ ] Confirm artifact naming format is still correct.
  - [ ] Confirm Linux executable / WM class names are correct.
  - [ ] Confirm staging metadata uses the final brand.
  - [ ] Confirm CLI help text uses the final brand.

### README and docs

- [ ] `README.md`
  - [ ] Update title.
  - [ ] Update product description.
  - [ ] Update release URL.
  - [ ] Update package manager install commands if branding changes.
- [ ] `docs/`
  - [ ] Update public-facing brand references.
  - [ ] Update screenshots and examples if they display old branding.
- [ ] `.docs/`
  - [ ] Update any user-facing guidance or examples.

### Marketing site

- [ ] `apps/marketing/src/layouts/Layout.astro`
  - [ ] Update default title.
  - [ ] Update meta description.
  - [ ] Update nav icon alt text.
  - [ ] Update GitHub / external links if repo changes.
  - [ ] Update footer copy if company name changes.
- [ ] `apps/marketing/src/pages/index.astro`
  - [ ] Update hero headline.
  - [ ] Update download button / label copy.
  - [ ] Update screenshot alt text.
  - [ ] Confirm release download logic still resolves correct assets.
- [ ] `apps/marketing/src/pages/download.astro`
  - [ ] Update page title.
  - [ ] Update page description.
  - [ ] Update page heading.
  - [ ] Confirm each platform card still matches the release asset names.
  - [ ] Confirm changelog link works.
- [ ] `apps/marketing/dist/`
  - [ ] Rebuild the marketing site output.
  - [ ] Confirm no stale build artifacts are being deployed.

### Release scripts and notifications

- [ ] `scripts/notify-discord-release.ts`
  - [ ] Update release announcement copy.
  - [ ] Update prerelease / latest wording if needed.
- [ ] `scripts/release-smoke.ts`
  - [ ] Confirm smoke test asset names still match release artifacts.
- [ ] `scripts/merge-update-manifests.ts`
  - [ ] Confirm artifact naming assumptions still hold.

---

## 4. User-facing feature checks

### Core app flows

- [ ] Start app from a clean install.
- [ ] Open existing session.
- [ ] Create a new session.
- [ ] Switch providers/models.
- [ ] Send a message and receive a response.
- [ ] Approve / deny pending actions.
- [ ] Open files and follow links.
- [ ] Use source control actions.
- [ ] Use terminal integration.
- [ ] Use settings panels.

### Environment / connection flows

- [ ] Local connection works.
- [ ] Remote connection works if supported.
- [ ] Pairing flow works.
- [ ] Desktop-to-server connection works.
- [ ] WebSocket reconnect behavior works.
- [ ] Error states are readable and branded correctly.

### Update flows

- [ ] Available update is detected.
- [ ] Download update works.
- [ ] Install update works.
- [ ] Downloading state shows progress.
- [ ] Failed download state is recoverable.
- [ ] Failed install state is recoverable.
- [ ] Apple Silicon / Intel warning text is correct.

---

## 5. Build and packaging checks

### Web build

- [ ] Web app builds successfully.
- [ ] Web app typecheck passes.
- [ ] Web app tests pass.
- [ ] Web app production bundle does not contain stale brand text.

### Desktop build

- [ ] Desktop app builds successfully.
- [ ] Desktop typecheck passes.
- [ ] Desktop tests pass.
- [ ] Desktop smoke test passes.
- [ ] App icon assets are present and correct.
- [ ] macOS artifact is signed / notarized if required.
- [ ] Windows artifact is signed if required.
- [ ] Linux artifact launches correctly.

### Marketing build

- [ ] Marketing site builds successfully.
- [ ] Marketing site links resolve correctly.
- [ ] Download buttons resolve to the latest release asset URLs.
- [ ] Homepage and download page render correctly in production build.

---

## 6. External surfaces checklist

- [ ] GitHub repository link is correct.
- [ ] GitHub Releases link is correct.
- [ ] Winget package name is correct.
- [ ] Homebrew cask name is correct.
- [ ] AUR package name is correct.
- [ ] Discord invite link is correct.
- [ ] Any hosted app URL is correct.
- [ ] Any pairing URL / hosted URL references are correct.
- [ ] Any public docs or blog links are correct.

---

## 7. Search checklist before shipping

Run a repo-wide search for old brand strings and review every hit.

### Search terms to inspect

- [ ] `T3 Code`
- [ ] `pipper`
- [ ] `T3`
- [ ] `T3 Tools`
- [ ] `T3CODE_`
- [ ] `maker-or/pipper`
- [ ] `com.t3tools.pipper`

### What to verify in each hit

- [ ] Is it user-visible?
- [ ] Is it internal and intentionally preserved?
- [ ] Does it need a rename?
- [ ] Does it need a migration path?
- [ ] Does it affect update feeds or installers?

---

## 8. Final pre-release sign-off

- [ ] Rebranding reviewed and approved.
- [ ] Marketing site reviewed and approved.
- [ ] Desktop app reviewed and approved.
- [ ] Release artifacts uploaded.
- [ ] Auto-update verified.
- [ ] Smoke tests passed.
- [ ] Production build verified.
- [ ] No blocking issues remain.
- [ ] Release is safe to ship to users.

---

## 9. Notes / decisions

Use this section to record final decisions.

### Brand decisions

- Final product name: `polarish`
- Final public website name: `polarish`
- Final app display name: `polarish`
- Final desktop product name: `polarish` with channel suffixes like `polarish (Alpha)` and `polarish (Nightly)` where needed
- Final repo name: currently still `maker-or/pipper` until a repo migration is planned
- Final package / store listing names: pending store-by-store migration decisions

### Internal names kept intentionally

- `T3CODE_` env vars: keep for now to avoid breaking existing build/release automation
- `pipper:` local storage keys: keep for now unless a storage migration is implemented
- `pipper` executable / package name: mixed state today; CLI package is already `@polarish/agent`, desktop executable still needs an explicit migration decision
- `com.t3tools.pipper` app ID: keep for now unless updater/install migration is designed and validated
- GitHub repo slug: currently `maker-or/pipper`

### Migration notes

- Old brand redirects: needed if website, repo, or docs URLs move
- Update feed changes: required before changing `appId`, executable names, or artifact naming conventions
- Release asset naming changes: audit `scripts/build-desktop-artifact.ts`, `scripts/release-smoke.ts`, marketing download matching, and any package registry publishing
- User migration steps: define only if storage keys, app ID, installer IDs, or package names change
