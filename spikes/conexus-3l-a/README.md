# Package A qualification spike

This directory is **3L evidence-only**. It is not product implementation and creates no product dependency.

The spike starts by closing the Q0 transitive lock for the exact Package A candidate set before any deciding probe runs. Later probe code and fixtures live here and remain bound to the recorded package-lock digest.

Current direct pins:

- `@mastra/core@1.55.0`
- `@mastra/e2b@0.7.0`
- `@mastra/memory@1.24.0`
- `@mastra/pg@1.18.1`
- Node `24.18.0`

No E2B/model credential belongs in this directory or its committed artifacts.
