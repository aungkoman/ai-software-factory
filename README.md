# AI Software Factory

GitHub-native PRD-to-code orchestration. Sprint 1 implements a safe local CLI, durable SQLite state, policy checks, and unit tests. Coding agents and the Laravel/Next.js pilot are planned for later sprints; no autonomous code execution is enabled in Sprint 1.

## Sprint 1

- Node.js 22+, npm
- `npm install`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `node dist/cli.js init`
- `node dist/cli.js submit examples/clinic-prd.md --repo aungkoman/pilot-clinic-crud`
- `node dist/cli.js status <run-id>`

No GitHub credentials are required for the local workflow. This project deliberately does not execute arbitrary PRD instructions or shell commands.
