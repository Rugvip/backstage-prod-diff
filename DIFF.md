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

1. Copy example template to repo
1. Push to GitHub, add to app-config.yaml locations
1. Token had wrong scope, replace PAT with one that has access

---

## Switch to GitHub App for integration

1. Find docs that reference `yarn backstage-cli create-github-app` <!-- TODO: copyable command -->
<!-- TODO: Recommend creation of demo org if needed -->
1. Try to create app for user, be confused by 404 and no sign-in <!-- TODO: some way to create app for user? -->
1. Copy paste the $include line from https://backstage.io/docs/plugins/github-apps#including-in-integrations-config but it needs to be rewritten <!-- TODO: Clarify that tne file name is just an example in there, perhaps even make the CLI print out the exact instruction? -->
1. Add the app credentials to the production configuration

## Switch to GitHub discovery provider <!-- TODO: this doesn't exist -->

1. Find the docs under integrations
1. Install the package in packages/backend, get confused by not being instructed to add `@backstage/integration` too
1. Copy imports code into places as per the documentation
1. Copy setup code into places as per the documentation
1. Install `@backstage/integration`
1. Start configuring, but note that it tells you to set a GITHUB_TOKEN even though we're using an app instead

   ```yaml
   - type: github-discovery
     target: https://github.com/Rugvip/backstage-*/blob/-/catalog-info.yaml
   ```

## Add GitHub org ingestion

<!-- TODO: Remove addendum at https://backstage.io/docs/integrations/github/org -->

1. Stuck because there are no docs
1. Add permission on existing app
<!-- TODO: We should really have an interactive cli when creating the Github app so you can select permissions for what you want the github app to do-->

- Go to the developer settings for the Github App
- Add the extra permission

1. Go to installation and approve the adjusted permission changes
1. Create and add `GitHubOrgEntityProvider`
1. Add missing import for `GitHubOrgEntityProvider`
1. Set up scheduling of said provider with `env.scheduler.scheduleTask`
1. Add import for `Duration`
1. Install missing Luxon dependency
1. Fail to set up scheduling, called `frobs.run()` instead of the provider
   <!-- TODO: No feedback when scheduled task fails -->
   <!-- TODO: Signal handler for node process to exit quickly in docker -->

## Switch to GitHub sign-in resolver

1. Find in the docs at https://backstage.io/docs/auth/identity-resolver
1. No existing example using `result` for information not in ProfileInfo. Source code lookup required
1. Add missing imports for `DEFAULT_NAMESPACE` and `stringifyEntityRef`.
1. Ownership not working, had to debug by inspecting token <!-- TODO: Add users/ownership information somewhere -->
<!-- TODO: Docs on debugging, inspecting token, etc. -->
1. Figure out that GitHub profile `.id` is numerical, switch to `username`

## Switch to OAuth2Proxy + proxy auth provider

1. Read docs at https://backstage.io/docs/auth/oauth2-proxy/provider
1. Setup oauth2proxy in front of Backstage
1. Set up new GitHub OAuth2 client
1. Add OAuth proxy service to compose:

   ```yaml
   proxy:
     container_name: oauth2-proxy
     image: quay.io/oauth2-proxy/oauth2-proxy:v7.2.1
     command: >-
       --upstream=http://backstage:7007
       --set-authorization-header=true
       --provider=github
       --client-id=${PROXY_GITHUB_CLIENT_ID}
       --client-secret=${PROXY_GITHUB_CLIENT_SECRET}
       --http-address=0.0.0.0:4180
       --redirect-url=http://localhost:7007/oauth2/callback
       --cookie-secret=${PROXY_COOKIE_SECRET}
       --cookie-secure=false
       --email-domain=*

     hostname: oauth2-proxy
     ports:
       - 7007:4180/tcp
   ```

1. Copy over example auth provider setup at https://backstage.io/docs/auth/oauth2-proxy/provider
1. Add oauth2 provider, copy resolver
1. Modify the sign-in resolver to "work" with GitHub - spoiler, it doesn't
1. Switch out `SignInPage`, using `NODE_ENV` to select:

   ```tsx
   SignInPage: props => <ProxiedSignInPage {...props} provider="oauth2proxy" />;
   ```

1. Figure out that this does not run in local development.
1. Add production/dev check for the `SignInPage`:

   ```tsx
   SignInPage: props => {
     if (process.env.NODE_ENV === 'development') {
       return <SignInPage {...props} auto provider={githubProvider} />;
     }
     return <ProxiedSignInPage {...props} provider="oauth2proxy" />;
   },
   ```

1. Back to the OAuth2Proxy setup, realize that we need an additional proxy in between to rewrite headers, since OAuth2Proxy always embeds it in the Authorization header.
1. Create alpha configuration that remaps to a header:

   ```yaml
   injectRequestHeaders:
     - name: X-OAUTH2-PROXY-ID-TOKEN
       values:
         - value: QmVhcmVyIGUzMC5leUp6ZFdJaU9pSlNkV2QyYVhBaWZRLmUzMA==

   server:
     BindAddress: 0.0.0.0:4180

   upstreamConfig:
     upstreams:
       - id: backstage
         path: /
         uri: http://backstage:7007
       - id: httpbin
         path: '^/httpbin/(.*)$'
         rewriteTarget: '/$1'
         uri: http://httpbin

   providers:
     - id: github
       provider: github
       clientId: ae98713801ffb8135fab
       clientSecretFile: /proxy-client-secret-credentials.yaml
   ```

1. Switch over to using the new alpha configuration in docker-compose.

   ```yaml
   command: >-
     --redirect-url=http://localhost:7007/oauth2/callback
     --cookie-secret=${PROXY_COOKIE_SECRET}
     --cookie-secure=false
     --email-domain=*
     --alpha-config=/proxy-config.yaml
   ```

1. Realize that the auth result only contain the GitHub id token meaning the resolver have no method for identifying the user out of the box.
1. Set up and use httpbin to actually be able to troubleshoot this.
1. Leave this as a hardcoded token for now to be unblocked, but for GitHub this setup is incomplete and there is no way to properly set things up. <!-- TODO: FIX THIS -->

## Split scaffolder and catalog into separate backends

1. Copy `packages/backend` -> `packages/backend-catalog`
1. Update `"name"` in `packages/backend-catalog/package.json`
1. Clean up `"dependencies"` in `packages/backend-catalog/package.json`
1. Deleted `@backstage/plugin-scaffolder-backend` by mistake, restore
1. Delete all plugin setups in `packages/backend-catalog/src/plugins` except for `catalog.ts`
1. Delete a few more dependencies, like `app` and `dockerode`.
1. Remove all other plugin setups from `packages/backend-catalog/src/index.ts`
1. Clean up imports in `packages/backend-catalog/src/index.ts`
1. Delete catalog setup from main backend `packages/backend/src/plugins/catalog.ts`
1. Remove catalog from main backend `packages/backend/src/index.ts`
1. Remove catalog dependency from main backend `packages/backend/package.json`
1. Realize that catalog-backend is still needed by search
1. Realize that catalog-model is still needed by auth resolver

### deployment setup

1. Duplicate the `backstage` service in `docker-compose.yaml` with appropriate config
1. Update the `build-image` script in `packages/backend-catalog/package.json`
1. Create new `app-config.catalog.yaml` with catalog specific config <!-- TODO: this is painful -->
1. Mount new config in the catalog service
1. Realize the the `backend-catalog` dockerfile builds the wrong thing - update Dockerfile
1. Update `.dockerignore` to not ignore `packages/backend-catalog`

### routing

1. Write up a custom discovery implementation

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

1. Hook up the new discovery implementation
1. Copy over and tweak the custom discovery implementation to backend-catalog

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

1. Forgot to import `PluginEndpointDiscovery`, fix
1. Configure proxy to route `/api/catalog/` to the catalog backend

### Scaffolder split

1. Repeat all of the above for the scaffolder
1. Update discovery implementation in `packages/backend/src/index.ts`
1. Update discovery implementation in `packages/backend-catalog/src/index.ts`
