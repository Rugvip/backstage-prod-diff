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
   +  depends_on:
   +    - db
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

1. Use your existing Personal Access Token or generate a new one via https://github.com/settings/tokens
1. Make sure the token is set in the environment as `GITHUB_TOKEN=yourGeneratedToken`.
1. Create `app-config.local.yaml`
1. Add integration config to `app-config.local.yaml` with a dev token for local development
1. Add github token to environment section in docker-compose

## Set up GitHub OAuth App for sign-in with guest resolver

1. Follow https://backstage.io/docs/auth/github/provider
1. Generate a new GitHub OAuth app at https://github.com/settings/applications/new
1. Update `app-config.local.yaml` with

   ```yaml
   auth:
     environment: development
     providers:
       github:
         development:
           clientId: <id>
           clientSecret: <secret>
   ```

1. Update `app-config.yaml` with

   ```yaml
   auth:
     environment: development
     providers:
       github:
         development:
           clientId: ${AUTH_GITHUB_CLIENT_ID}
           clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
   ```

1. Update `docker-compose.yaml` with the tokens with `clientId` `clientSecret`.

   ```yaml
   version: '3'
   services:
   backstage:
     image: backstage
     ports:
       - '7007:7007'
     depends_on:
       - db
     environment:
       POSTGRES_PASSWORD: postgres
       GITHUB_TOKEN: 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
       AUTH_GITHUB_CLIENT_ID: 2f774a41542fa576b19d
       AUTH_GITHUB_CLIENT_SECRET: fc454c4eb92bd9f1de4f6492b48c2ab10eb69e52

   db:
     image: postgres
     environment:
       POSTGRES_USER: postgres
       POSTGRES_PASSWORD: postgres
   ```

1. Configure Sign-In Page at `packages/app/src/App.tsx` by providing a `SignInPage`.
1. ... and add SignInProviderConfig.
1. ... and add missing imports.

1. Configure identity resolver by reading https://backstage.io/docs/auth/identity-resolver
1. Copy paste two pieces of code
1. Cleanup to match
   // [TODO: docs does not tell you how to do this]

   ```diff
   +  providerFactories: {
   +    github: createGithubProvider({
   +      signIn: {
   +        resolver: async (_result, ctx) => {
   +          // Issue the token containing the entity claims
   +          const token = await ctx.tokenIssuer.issueToken({
   +            claims: {
   +              sub: 'user:default/guest',
   +              ent: ['user:default/guest'],
   +            },
   +          });
   +          return { id: 'guest', token };
   +        },
   +      },
   +    }),
   +  },
   ```

## Define 3 custom mock entities in GitHub + register them manually

1. Get rid of the example locations from `app-config.yaml`
1. Be in a world of pain trying to figure out the format, mostly based on https://backstage.io/docs/features/software-catalog/descriptor-format
1. Also figure out how to define a System
1. Also figure out how to define an API
1. Also figure out entity refs and how they work - need to say `user:guest` for example, now also have to read https://backstage.io/docs/features/software-catalog/references
1. git commit && git push
1. Click create component
1. Click Register Existing component
1. Paste URL to file(s) containing entities.
1. Click Analyze
1. Forget to add a `definition` to the API entity, fix that
1. Click Import

## Get the scaffolder plugin running with one custom template in GitHub

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
