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
          resolver: async (_result, ctx) => {
            // Issue the token containing the entity claims
            const token = await ctx.tokenIssuer.issueToken({
              claims: {
                sub: 'user:default/guest',
                ent: ['user:default/guest'],
              },
            });
            return { id: 'guest', token };
          },
        },
      }),
    },
  });
}
