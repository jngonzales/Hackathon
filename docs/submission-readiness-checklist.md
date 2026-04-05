# Submission Readiness Checklist

This file lists what is still missing before `OneDev` is actually ready for hackathon submission.

Current repo status:
- Code scaffold is implemented
- Verification script works
- GitHub repo is live: `https://github.com/jngonzales/Hackathon`
- Intended demo host is `Vercel`
- Submission is still blocked by missing deployment, media, and hackathon compliance items

## 1. Deploy The Project

### What to do
- Push changes to GitHub
- Import the GitHub repo into Vercel
- Create a live deployment
- Copy the production URL

### How to get it
- Go to `https://vercel.com`
- Sign in
- Choose `Add New -> Project`
- Import `jngonzales/Hackathon`
- Finish the deployment flow
- Copy the final production URL

### Where to put it
- `config/app.config.json`
- Set `submission.demoUrl`

## 2. Add Required Submission Media

The submission form requires:
- Cover image
- Demo video
- Presentation link

You do not need to show your face or use your voice.

### Recommended no-face version
- Cover image: screenshot of the app or a branded title card
- Demo video: screen recording with captions or text overlays
- Presentation: Google Slides, Canva deck, or PDF with screenshots and architecture

### What to do
- Create one cover image
- Create one silent screen-recorded demo
- Create one short slide deck
- Upload each asset somewhere public

### How to get them

#### Cover image
- Use a screenshot from the app, terminal output, dashboard, or a clean title graphic
- Export as `.png` or `.jpg`
- Upload to a public location like GitHub, Google Drive public share, Imgur, Cloudinary, or a static site

#### Demo video
- Record your screen with OBS, Loom, or ScreenPal
- Show:
  - app/project overview
  - strategy decision
  - risk gate
  - execution output
  - validation artifacts
  - readiness report
- Add text captions instead of narration if you want
- Upload as unlisted to YouTube, Loom, or another public link host

#### Presentation
- Make 5 to 8 slides covering:
  - problem
  - hackathon fit
  - architecture
  - Kraken CLI integration
  - risk controls
  - ERC-8004 evidence
  - demo flow
  - next steps
- Export as PDF if needed
- Upload to Google Slides, Canva, or a public file host

### Where to put them
- `config/app.config.json`
- Set:
  - `submission.media.coverImage`
  - `submission.media.demoVideo`
  - `submission.media.presentation`

## 3. Register At Early Surge

This is required for prize eligibility.

### What to do
- Register the project at `early.surge.xyz`
- Save the project URL

### How to get it
- Log in to `https://early.surge.xyz`
- Create or register the project for the hackathon
- Copy the resulting project page URL

### Where to put it
- `config/app.config.json`
- Set:
  - `submission.hackathonCompliance.earlySurge.registered` to `true`
  - `submission.hackathonCompliance.earlySurge.projectUrl` to the URL

## 4. Build In Public

The Kraken-side instructions explicitly require public progress sharing.

### What to do
- Publish at least one public progress post

### Good options
- X / Twitter post
- LinkedIn post
- GitHub discussion or devlog
- Public Discord announcement if it has a stable link

### What the post should include
- project name
- what you built
- that it uses Kraken CLI
- screenshots or short video clip
- repo link

### Where to put it
- `config/app.config.json`
- Add links to:
  - `submission.socialMediaPosts`
  - `submission.hackathonCompliance.kraken.buildInPublicLinks`

## 5. Install And Verify Kraken CLI

The hackathon requirement is not that your codebase be Rust.
The requirement is that your agent use Kraken CLI, which is a Rust binary.

### What to do
- Install Kraken CLI from the official source
- Confirm `kraken-cli` runs on your machine
- Connect the agent to Kraken CLI

### How to get it
- Follow the official Kraken CLI installation instructions
- After install, verify from terminal:

```powershell
kraken-cli --help
```

### Why this matters
- This repo is JavaScript, which is fine
- The JS app can still comply if it programmatically calls the Kraken CLI binary
- The current code already has a Kraken CLI transport boundary

Relevant files:
- [config/app.config.json](/c:/Users/jngon/OneDrive/Desktop/CODE/Hackathon/config/app.config.json)
- [src/execution/kraken-cli-transport.js](/c:/Users/jngon/OneDrive/Desktop/CODE/Hackathon/src/execution/kraken-cli-transport.js)

## 6. Move From Simulation To Paper Or Real Kraken Execution

Current status:
- `execution.mode` is still `simulation`
- `allowCommandExecution` is still `false`

That means the code is prepared for Kraken CLI integration, but it is not yet actually invoking Kraken CLI.

### What to do
- Install Kraken CLI
- decide whether you will use `paper` or live mode
- update config
- run a real paper-capable path through the adapter

### Where to change it
- `config/app.config.json`

### Fields to update

```json
{
  "execution": {
    "mode": "paper",
    "allowCommandExecution": true,
    "commandPath": "kraken-cli"
  }
}
```

### Important
- Do not enable live execution until you understand the exact Kraken CLI behavior and account permissions
- Paper mode is the safer first target

## 7. Add Kraken Verification Fields

These fields are optional for non-Kraken submissions, but your project is targeting Kraken too.

### What to do
- Create a read-only Kraken API key
- collect your Kraken account ID or username

### How to get it
- Log in to Kraken
- Create an API key with read-only permissions only
- Do not grant withdrawal permissions
- Do not store the API secret in this repo
- Copy the API key and account identifier

### Where to put it
- `config/app.config.json`
- Set:
  - `submission.krakenVerification.apiKey`
  - `submission.krakenVerification.accountId`
  - `submission.hackathonCompliance.kraken.readOnlyAuditReady` to `true` once done

## 8. Resolve ERC-8004 Truthfully

Do not mark these fields `true` unless the project actually implements them.

Current blockers:
- identity registration
- reputation tracking
- capital sandbox
- risk router

### What to do
- Determine which ERC-8004 features are actually implemented
- If implemented, wire them into the project and evidence trail
- If not implemented, leave them `false` for now

### Where to put it
- `config/app.config.json`
- Fields:
  - `submission.hackathonCompliance.erc8004.identityRegistered`
  - `submission.hackathonCompliance.erc8004.reputationTrackingEnabled`
  - `submission.hackathonCompliance.erc8004.capitalSandboxEnabled`
  - `submission.hackathonCompliance.erc8004.riskRouterEnabled`

## 9. Re-run Readiness Check

After each major update, re-run:

```powershell
npm run verify
```

Submission is ready only when:
- `submissionReadiness.ready` becomes `true`
- required media fields are present
- hackathon compliance blockers are resolved for the track you are honestly claiming

## 10. Minimum Practical Order

Recommended order:
1. Deploy to Vercel and get `demoUrl`
2. Create cover image
3. Record silent demo video
4. Create slide deck
5. Register at `early.surge.xyz`
6. Publish one build-in-public post
7. Install Kraken CLI
8. Test paper execution path
9. Add Kraken verification fields
10. Reassess ERC-8004 claims
11. Run `npm run verify`

## 11. Current Missing Fields Summary

At the time this file was written, the readiness blockers were:
- `submission.demoUrl`
- `submission.media.coverImage`
- `submission.media.demoVideo`
- `submission.media.presentation`
- `submission.hackathonCompliance.earlySurge.registered`
- `submission.hackathonCompliance.earlySurge.projectUrl`
- `submission.hackathonCompliance.kraken.buildInPublicLinks`
- `submission.hackathonCompliance.erc8004.identityRegistered`
- `submission.hackathonCompliance.erc8004.reputationTrackingEnabled`
- `submission.hackathonCompliance.erc8004.capitalSandboxEnabled`
- `submission.hackathonCompliance.erc8004.riskRouterEnabled`

## 12. When To Ask For Reassessment

Ask for reassessment after you have done one of these:
- updated `config/app.config.json`
- deployed the app
- created media assets
- registered at `early.surge.xyz`
- installed Kraken CLI
- tested paper execution

Then run:

```powershell
npm run verify
```

and review the remaining blockers.
