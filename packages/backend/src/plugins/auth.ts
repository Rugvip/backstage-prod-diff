import {
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  createRouter,
  createGithubProvider,
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      github: createGithubProvider({
        signIn: {
          resolver: async ({ result }, ctx) => {
            if (!result.fullProfile.username) {
              throw new Error('Username missing sir');
            }
            const userEntityRef = stringifyEntityRef({
              kind: 'User',
              namespace: DEFAULT_NAMESPACE,
              name: result.fullProfile.username,
            });
            // Resolve group membership from the Backstage catalog
            const fullEnt =
              await ctx.catalogIdentityClient.resolveCatalogMembership({
                // resolveCatalogOwnership?
                entityRefs: [userEntityRef],
                logger: ctx.logger,
              });
            const token = await ctx.tokenIssuer.issueToken({
              claims: { sub: userEntityRef, ent: fullEnt },
            });
            return { id: '', token };
          },
        },
      }),
    },
  });
}
