# Security baseline

- No agent shell execution or automatic merge in Sprint 1.
- PRDs and repository content are untrusted data, never executable instructions.
- Reject traversal, `.env`, `.git`, and `.github/workflows` changes by policy.
- Do not pass GitHub tokens, production secrets, Docker socket, or SSH agents to untrusted workers.
- Future GitHub App must use short-lived installation tokens and minimal repository permissions.
- CI uses read-only token, SHA-pinned actions, no `pull_request_target`, no deploy secrets.
- GitHub branch protection and required reviews must be configured by a repository administrator.
- Sandbox and network restrictions are future Sprint 3 work; do not run arbitrary coding agents before they are enforced.
