# Trading Agent — Kraken + ERC-8004

A submission skeleton for a trading agent that reconciles a Kraken strategy with
an on-chain ERC-8004 identity, plus the verification harness and report page
used to show what the agent decided and why.

## Structure

```
src/            agent code, entry point at src/index.js
src/verify.js   verification harness
test/           node:test suites
api/            request handlers
config/         strategy and environment configuration
openspec/       behaviour specification for the agent
docs/           design notes and runbooks
index.html      report dashboard (readiness, execution mode, approved and rejected outcomes)
```

## Run it

Node 22 or newer.

```bash
npm run bootstrap   # node src/index.js
npm run verify      # node src/verify.js
npm test            # node --test
```

Report page: https://hackathon-five-alpha-71.vercel.app

## Notes

`index.html` reads a generated report artefact and renders it — readiness state,
execution mode, and the approved versus no-trade outcomes side by side. It is a
reporting surface, not a trading control.
