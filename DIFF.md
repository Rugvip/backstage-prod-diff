# Diff

## Deploy locally with docker-compose

1. Run `yarn workspace backend build` (builds both backend and frontend)
1. Run `yarn build-image`
1. Create docker-compose.yml with a single backend service

   ```yaml
   version: '3'
   services:
     backstage:
       image: backstage
       ports:
         - '7007:7007'
   ```

1. Start it with `docker-compose up`

## Switch to PostgreSQL

1. Add `pg` as a dependency in `packages/backend/package.json`

   ```diff
    "dependencies": {
   +  "pg": "^8.3.0",
   ```

1. Run `yarn install` to update `yarn.lock`

1. Updating docker-compose.yaml with postgres service

   ```diff
    backstage:
      image: backstage
      ports:
        - '7007:7007'
   +  environment:
   +    POSTGRES_PASSWORD: postgres
   +
   +  db:
   +   image: postgres
   +   environment:
   +     POSTGRES_USER: postgres
   +     POSTGRES_PASSWORD: postgres
   ```

1. Updating app-config.production.yaml

   ```diff
    app:
      # Should be the same as backend.baseUrl when using the `app-backend` plugin
      baseUrl: http://localhost:7007

    backend:
      baseUrl: http://localhost:7007
      listen:
        port: 7007

   +  database:
   +    client: pg
   +    connection:
   +      host: db
   +      port: 5432
   +      user: postgres
   +      password: ${POSTGRES_PASSWORD}
   ```

1. Update Dockerfile to copy `app-config.production.yaml` into image:

   ```diff
   -COPY packages/backend/dist/bundle.tar.gz app-config.yaml ./
   +COPY packages/backend/dist/bundle.tar.gz app-config.yaml app-config.production.yaml ./
   ```

1. Update Dockerfile to use `app-config.production.yaml`:

   ```diff
   -CMD ["node", "packages/backend", "--config", "app-config.yaml"]
   +CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
   ```

1. Run `yarn workspace backend build` (builds both backend and frontend)
1. Run `yarn build-image`
1. Start it with `docker-compose up`

## Enable GitHub backend integration with PAT

1.

## Set up GitHub OAuth App for sign-in with demo resolver

1.

## Get the scaffolder plugin running with one custom template in GitHub

1.

## Define 3 custom mock entities in GitHub + register them manually

1.

---

## Switch to GitHub App for integration

1.

## Switch to GitHub discovery provider

1.

## Add GitHub org ingestion + sign-in resolver

1.

## Switch to OAuth2Proxy + proxy auth provider

1.

## Split scaffolder and catalog into separate backends

1.
