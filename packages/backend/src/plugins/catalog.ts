import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  GithubDiscoveryProcessor,
  GitHubOrgEntityProvider,
  GithubOrgReaderProcessor,
} from '@backstage/plugin-catalog-backend-module-github';
import {
  ScmIntegrations,
  DefaultGithubCredentialsProvider,
} from '@backstage/integration';
import { Duration } from 'luxon';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  const integrations = ScmIntegrations.fromConfig(env.config);
  const githubCredentialsProvider =
    DefaultGithubCredentialsProvider.fromIntegrations(integrations);
  builder.addProcessor(
    GithubDiscoveryProcessor.fromConfig(env.config, {
      logger: env.logger,
      githubCredentialsProvider,
    }),
    GithubOrgReaderProcessor.fromConfig(env.config, {
      logger: env.logger,
      githubCredentialsProvider,
    }),
  );
  builder.addProcessor(new ScaffolderEntitiesProcessor());

  const githubOrgProvider = GitHubOrgEntityProvider.fromConfig(env.config, {
    id: 'github',
    logger: env.logger,
    orgUrl: 'https://github.com/blamdemo',
  });
  builder.addEntityProvider(githubOrgProvider);
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  await env.scheduler.scheduleTask({
    id: 'github_org_refresh',
    fn: async () => {
      try {
        await githubOrgProvider.read();
      } catch (error) {
        env.logger.error(`GitHub org ingestion failed, ${error}`);
      }
    },
    frequency: Duration.fromObject({ minutes: 30 }),
    timeout: Duration.fromObject({ minutes: 10 }),
  });

  return router;
}
