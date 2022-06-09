# Diff Recount

## Deploy locally with docker-compose

1. [x] Run `yarn workspace backend build` (builds both backend and frontend)
1. [x] Run `yarn build-image`
1. [x] Create docker-compose.yml with a single backend service

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
         POSTGRES_HOST: db
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres

     db:
       image: postgres
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
   ```

1. [x] Start it with `docker-compose up`

<!-- Works, but catalog has no content as the examples are not added to the image, tweak? -->

## Enable GitHub backend integration with PAT

1. [x] Use your existing Personal Access Token or generate a new one via https://github.com/settings/tokens
1. [x] Add integration config to `app-config.local.yaml` with a dev token for local development
1. [x] Add github token to environment section in docker-compose

## Set up GitHub OAuth App for sign-in with guest resolver

1. [x] Follow https://backstage.io/docs/auth/github/provider
1. [x] Generate a new GitHub OAuth app at https://github.com/settings/applications/new
1. [x] Update `app-config.local.yaml` with

   ```yaml
   auth:
     environment: development
     providers:
       github:
         development:
           clientId: <id>
           clientSecret: <secret>
   ```

1. [x] Update `app-config.yaml` with

   ```yaml
   auth:
     environment: development
     providers:
       github:
         development:
           clientId: ${AUTH_GITHUB_CLIENT_ID}
           clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
   ```

1. [x] Update `docker-compose.yaml` with the tokens with `clientId` `clientSecret`.

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

1. [x] Configure Sign-In Page at `packages/app/src/App.tsx` by providing a `SignInPage`.

<!-- Update SignInPage example in getting started guide -->

1. [x] ... and add missing imports.

1. [x] Configure identity resolver by reading https://backstage.io/docs/auth/identity-resolver

<!-- Add this example to docs -->
1. [x] Copy-paste
   ```diff
   +  signIn: {
   +  resolver(_, ctx) {
   +    return ctx.issueToken({
   +      claims: {
   +        sub: 'user:default/guest',
   +        ent: ['user:default/guest']
   +      }
   +    })
   +  }
   +},
   ```

## Define 3 custom mock entities in GitHub + register them manually

<!-- Maybe add COPY examples to Dockerfile? -->
<!-- Figure out how to improve relative file locations so that they are more intuitive. Create a lightweight RFC to gather feedback -->

1. [x] Copy examples/entities.yaml to to data/entities.yaml
1. [x] Also figure out entity refs and how they work - need to say `user:guest` for example, now also have to read https://backstage.io/docs/features/software-catalog/references
1. [x] git commit && git push
1. [x] Click create component
1. [x] Click Register Existing component
1. [x] Paste URL to file(s) containing entities.
1. [x] Click Analyze
1. [x] Click Import

## Get the scaffolder plugin running with one custom template in GitHub

<!-- TODO: Add empty catalog.locations block to app-config.production.yaml -->

1. [x] Copy example template to repo
1. [x] Push to GitHub, add to app-config.yaml locations

---

## Switch to GitHub App for integration

1. [x] Find docs that reference `yarn backstage-cli create-github-app`
1. [x] Add the app credentials to the production configuration. Note: needs to be added to Dockerfile, but we don't count that

## Switch to GitHub discovery provider <!-- TODO: this doesn't exist -->

1. [x] Find the docs under integrations
1. [x] Install the package in packages/backend
1. [x] Copy imports code into places as per the documentation
1. [x] Copy setup code into places as per the documentation
1. [x] Start configuring, but note that it tells you to set a GITHUB_TOKEN even though we're using an app instead

   ```yaml
   - type: github-discovery
     target: https://github.com/Rugvip/backstage-*/blob/-/catalog-info.yaml
   ```

## Add GitHub org ingestion

1. [x]  Create and add `GitHubOrgEntityProvider`, according to https://backstage.io/docs/integrations/github/org
1. [x]  Add missing import for `GitHubOrgEntityProvider`

<!-- TODO: Add org members read permission to the GitHub app CLI -->

<!-- TODO: Something might've gone wrong with the scheduling, we didn't see it running initially -->

<!-- TODO: Signal handler for node process to exit quickly in docker -->

## Switch to GitHub sign-in resolver

<!-- TODO: Make it easier to find the built-in resolvers in the docs -->

1. [x] Find in the docs at https://backstage.io/docs/auth/identity-resolver
1. [x] Add built-in GitHub resolver: `providers.github.resolvers.usernameMatchingUserEntityName`

<!-- TODO: Add users/ownership information somewhere in the frontend -->

<!-- TODOish: See if we can clean up https://backstage.io/docs/reference/plugin-auth-backend.providers -->

## Switch to OAuth2Proxy + proxy auth provider

1. [x] Read docs at https://backstage.io/docs/auth/oauth2-proxy/provider
1. [x] Setup oauth2proxy in front of Backstage
1. [x] Set up new GitHub OAuth2 client
1. [x] Add OAuth proxy service to compose:

   ```yaml
   proxy:
     image: quay.io/oauth2-proxy/oauth2-proxy:v7.2.1
     command: >-
       --upstream=http://backstage:7007
       --provider=github
       --client-id=${PROXY_GITHUB_CLIENT_ID}
       --client-secret=${PROXY_GITHUB_CLIENT_SECRET}
       --http-address=0.0.0.0:4180
       --redirect-url=http://localhost:7007/oauth2/callback
       --cookie-secret=${PROXY_COOKIE_SECRET}
       --cookie-secure=false
       --email-domain=*

     ports:
       - 7007:4180/tcp # remove/switch backend port
   ```

<!-- TODO: Fix oauth2Proxy casing -->

<!-- TODOish: Fix logout for proxy providers -->

1. [x] Copy over example auth provider config at https://backstage.io/docs/auth/oauth2-proxy/provider
1. [x] Add oauth2 provider, copy resolver

<!-- TODOish: stronger encouragement to head to proxy sign-in page docs -->

1. [x] Copy over sign-in page setup from https://backstage.io/docs/auth/#sign-in-with-proxy-providers
1. [x] Switch out google example setup for oauth2proxy:

## Split scaffolder and catalog into separate backends

1. [ ] Copy `packages/backend` -> `packages/backend-catalog`
1. [ ] Update `"name"` in `packages/backend-catalog/package.json`
1. [ ] Clean up `"dependencies"` in `packages/backend-catalog/package.json`
1. [ ] Deleted `@backstage/plugin-scaffolder-backend` by mistake, restore
1. [ ] Delete all plugin setups in `packages/backend-catalog/src/plugins` except for `catalog.ts`
1. [ ] Delete a few more dependencies, like `app` and `dockerode`.
1. [ ] Remove all other plugin setups from `packages/backend-catalog/src/index.ts`
1. [ ] Clean up imports in `packages/backend-catalog/src/index.ts`
1. [ ] Delete catalog setup from main backend `packages/backend/src/plugins/catalog.ts`
1. [ ] Remove catalog from main backend `packages/backend/src/index.ts`
1. [ ] Remove catalog dependency from main backend `packages/backend/package.json`
1. [ ] Realize that catalog-backend is still needed by search
1. [ ] Realize that catalog-model is still needed by auth resolver

### deployment setup

1. [ ] Duplicate the `backstage` service in `docker-compose.yaml` with appropriate config
1. [ ] Update the `build-image` script in `packages/backend-catalog/package.json`
1. [ ] Create new `app-config.catalog.yaml` with catalog specific config <!-- TODO: this is painful -->
1. [ ] Mount new config in the catalog service
1. [ ] Realize the the `backend-catalog` dockerfile builds the wrong thing - update Dockerfile
1. [ ] Update `.dockerignore` to not ignore `packages/backend-catalog`

### routing

1. [ ] Write up a custom discovery implementation

   ```ts
   class CustomDiscovery implements PluginEndpointDiscovery {
     constructor(private readonly delegate: PluginEndpointDiscovery) {}

     async getBaseUrl(pluginId: string): Promise<string> {
       if (pluginId === 'catalog') {
         return `http://catalog:7007/api/catalog`;
       }
       return this.delegate.getBaseUrl(pluginId);
     }

     async getExternalBaseUrl(pluginId: string): Promise<string> {
       return this.delegate.getExternalBaseUrl(pluginId);
     }
   }
   ```

1. [ ] Hook up the new discovery implementation
1. [ ] Copy over and tweak the custom discovery implementation to backend-catalog

   ```ts
   class CustomDiscovery implements PluginEndpointDiscovery {
     constructor(private readonly delegate: PluginEndpointDiscovery) {}

     async getBaseUrl(pluginId: string): Promise<string> {
       if (pluginId === 'catalog') {
         return this.delegate.getBaseUrl(pluginId);
       }
       return `http://backstage:7007/api/${pluginId}`;
     }

     async getExternalBaseUrl(pluginId: string): Promise<string> {
       return this.delegate.getExternalBaseUrl(pluginId);
     }
   }
   ```

1. [ ] Forgot to import `PluginEndpointDiscovery`, fix
1. [ ] Configure proxy to route `/api/catalog/` to the catalog backend

### Scaffolder split

1. [ ] Repeat all of the above for the scaffolder
1. [ ] Update discovery implementation in `packages/backend/src/index.ts`
1. [ ] Update discovery implementation in `packages/backend-catalog/src/index.ts`
