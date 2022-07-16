import { App, readonly, Ref, ref } from 'vue';
import { Router } from 'vue-router';
import {
  AppState,
  EarthoPluginOptions,
  EarthoVueClient,
  EarthoVueClientOptions
} from './interfaces';
import { EARTHO_INJECTION_KEY, EARTHO_TOKEN } from './token';
import version from './version';
import {
  EarthoOne,
  IdToken,
  LogoutOptions,
  PopupConfigOptions,
  PopupConnectOptions,
  RedirectConnectOptions,
  RedirectLoginResult,
  GetTokenSilentlyOptions,
  GetTokenSilentlyVerboseResponse,
  User
} from '@eartho/one-client-js';
import { bindPluginMethods } from './utils';

/**
 * @ignore
 */
export const client: Ref<EarthoVueClient> = ref(null);

/**
 * @ignore
 */
export class EarthoPlugin implements EarthoVueClient {
  private _client: EarthoOne;
  private _isLoading: Ref<boolean> = ref(true);
  private _isConnected: Ref<boolean> = ref(false);
  private _user: Ref<User> = ref({});
  private _idToken: Ref<string> = ref();
  private _error = ref(null);

  isLoading = readonly(this._isLoading);
  isConnected = readonly(this._isConnected);
  user = readonly(this._user);
  idToken = readonly(this._idToken);
  error = readonly(this._error);

  constructor(
    private clientOptions: EarthoVueClientOptions,
    private pluginOptions?: EarthoPluginOptions
  ) {
    // Vue Plugins can have issues when passing around the instance to `provide`
    // Therefor we need to bind all methods correctly to `this`.
    bindPluginMethods(this, ['constructor']);
  }

  install(app: App) {
    this._client = new EarthoOne({
      ...this.clientOptions,
      earthoOne: {
        name: 'one-client-vue',
        version: version
      }
    });

    this.__checkSession(app.config.globalProperties.$router);

    app.config.globalProperties[EARTHO_TOKEN] = this;
    app.provide(EARTHO_INJECTION_KEY, this);

    client.value = this;
  }

  async connectWithRedirect(options?: RedirectConnectOptions<AppState>) {
    return this._client.connectWithRedirect(options);
  }

  async connectWithPopup(
    options?: PopupConnectOptions,
    config?: PopupConfigOptions
  ) {
    return this.__proxy(() => this._client.connectWithPopup(options, config));
  }

  async logout(options?: LogoutOptions) {
    if (options?.localOnly) {
      return this.__proxy(() => this._client.logout(options));
    }

    return this._client.logout(options);
  }

  /* istanbul ignore next */
  async connectSilently(
    options: GetTokenSilentlyOptions & { detailedResponse: true }
  ): Promise<GetTokenSilentlyVerboseResponse>;
  /* istanbul ignore next */
  async connectSilently(
    options?: GetTokenSilentlyOptions
  ): Promise<string>;
  /* istanbul ignore next */
  async connectSilently(
    options: GetTokenSilentlyOptions = {}
  ): Promise<string | GetTokenSilentlyVerboseResponse> {
    return this.__proxy(() => this._client.connectSilently(options));
  }

  async checkSession(options?: GetTokenSilentlyOptions) {
    return this.__proxy(() => this._client.checkSession(options));
  }

  async handleRedirectCallback(
    url?: string
  ): Promise<RedirectLoginResult<AppState>> {
    return this.__proxy(() =>
      this._client.handleRedirectCallback<AppState>(url)
    );
  }

  private async __checkSession(router?: Router) {
    const search = window.location.search;

    if (
      (search.includes('code=') || search.includes('error=')) &&
      search.includes('state=') &&
      !this.pluginOptions?.skipRedirectCallback
    ) {
      const result = await this.handleRedirectCallback();
      const appState = result?.appState;
      const target = appState?.target ?? '/';

      window.history.replaceState({}, '', '/');

      if (router) {
        router.push(target);
      }

      return result;
    } else {
      await this.checkSession();
    }
  }

  private async __refreshState() {
    this._isConnected.value = await this._client.isConnected();
    this._user.value = await this._client.getUser();
    this._isLoading.value = false;
  }

  private async __proxy<T>(cb: () => T, refreshState = true) {
    let result;
    try {
      result = await cb();
      this._error.value = null;
    } catch (e) {
      this._error.value = e;
      throw e;
    } finally {
      if (refreshState) {
        await this.__refreshState();
      }
    }

    return result;
  }
}
