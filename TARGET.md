# Target

<!-- What's our intended target setup? -->

## Backstage Getting Started Deployment

- Deploy locally with docker-compose

- Switch to PostgreSQL

- Enable GitHub backend integration with PAT

- Set up GitHub OAuth App for sign-in with demo resolver

- Define 3 custom mock entities in GitHub + register them manually

- Get the scaffolder plugin running with one custom template in GitHub

## Production Hardened Deployment

- Switch to GitHub App for integration

- Switch to GitHub discovery provider

- Add GitHub org ingestion + sign-in resolver

- Switch to OAuth2Proxy + proxy auth provider

- Split scaffolder and catalog into separate backends
  - Bundle them into separate containers
