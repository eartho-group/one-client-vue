import { inject } from 'vue';
import { Router } from 'vue-router';
import './global';
import {
  EarthoVueClient,
  EarthoPlugin,
  EarthoPluginOptions,
  EarthoVueClientOptions
} from './global';
import { EARTHO_INJECTION_KEY, EARTHO_TOKEN } from './token';

export * from './global';
export { EARTHO_INJECTION_KEY } from './token';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    [EARTHO_TOKEN]: EarthoVueClient;
  }
}

/**
 * Creates the Eartho plugin.
 *
 * @param clientOptions The Auth Vue Client Options
 * @param pluginOptions Additional Plugin Configuration Options
 * @returns An instance of EarthoPlugin
 */
export function createEarthoOne(
  clientOptions: EarthoVueClientOptions,
  pluginOptions?: EarthoPluginOptions
) {
  return new EarthoPlugin(clientOptions, pluginOptions);
}

/**
 * Returns the registered Eartho instance using Vue's `inject`.
 * @returns An instance of EarthoVueClient
 */
export function useEartho(): EarthoVueClient {
  return inject(EARTHO_INJECTION_KEY);
}
