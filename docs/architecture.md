# Architecture
GitHub-native control plane: PRD -> analyst -> architect -> planner -> GitHub issues -> sandboxed coding -> QA -> reviewed PR. GitHub is task source of truth; SQLite will persist execution state. This commit establishes directory boundaries, not a working agent runtime.
