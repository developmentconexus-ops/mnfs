# Package A qualification spike

This directory is **3L evidence-only**. It is not product implementation and creates no product dependency.

The spike closes an exact transitive lock for the admitted Package A candidate set before deciding probes run. Probe code and fixtures remain bound to the recorded package-lock digest.

Current latest-stable family pin for this qualification checkpoint:

- `@mastra/code-sdk@1.1.2`
- `@mastra/core@1.56.0`
- `@mastra/e2b@0.8.0`
- `@mastra/memory@1.25.0`
- `@mastra/pg@1.19.0`
- Node `24.18.0`

A3 uses Mastra Code's native `openai-codex` OAuth path for the operator-owned ChatGPT/Codex subscription. The main Builder actor is `gpt-5.6-sol`; Observational Memory Observer/Reflector use `gpt-5.6-luna` for the bounded qualification experiment.

No E2B/model credential belongs in this directory or its committed artifacts.
