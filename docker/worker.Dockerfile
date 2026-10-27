# Placeholder: intentionally no executable agent worker yet.
FROM node:22-alpine
WORKDIR /workspace
USER node
CMD ["node", "-e", "console.error('Agent execution disabled: sandbox not implemented'); process.exit(1)"]
