# Sprint 1 architecture

CLI -> SQLite (runs/events). The CLI registers a local PRD, stores a SHA-256 digest, and exposes state transitions. No LLM or GitHub writes are triggered. Future components: GitHub App, DAG scheduler, Codex adapter, isolated worker, approval service.

## Pilot

New Laravel API + Next.js CRUD app is planned as a separate pilot repository for Sprint 3. Sprint 1 does not claim a working pilot application.

## States

PENDING -> READY -> RUNNING -> VERIFYING -> COMPLETED. WAITING_APPROVAL, RETRY_PENDING, BLOCKED are explicit alternatives. Invalid transitions fail closed.
