import { RouteLocation } from 'vue-router';
import { watchEffectOnceAsync } from './utils';
import { client as earthoOne } from './plugin';
import { EARTHO_TOKEN } from './token';
import { EarthoVueClient } from './interfaces';
import { App, unref } from 'vue';

async function createGuardHandler(client: EarthoVueClient, to: RouteLocation) {
  const fn = async () => {
    if (unref(client.isConnected)) {
      return true;
    }

    await client.connectWithRedirect({
      appState: { target: to.fullPath }
    });

    return false;
  };

  if (!unref(client.isLoading)) {
    return fn();
  }

  await watchEffectOnceAsync(() => !unref(client.isLoading));

  return fn();
}

export function createAuthGuard(app: App) {
  return async (to: RouteLocation) => {
    const eartho = app.config.globalProperties[EARTHO_TOKEN] as EarthoVueClient;

    return createGuardHandler(eartho, to);
  };
}

export async function authGuard(to: RouteLocation) {
  const eartho = unref(earthoOne);

  return createGuardHandler(eartho, to);
}
