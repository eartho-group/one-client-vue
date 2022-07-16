import { EarthoOne } from '@eartho/one-client-js';
import { App, inject } from 'vue';
import { EARTHO_INJECTION_KEY, createEarthoOne, useEartho } from '../src/index';

const connectWithRedirectMock = jest.fn().mockResolvedValue(null);
const connectWithPopupMock = jest.fn().mockResolvedValue(null);
const logoutMock = jest.fn();
const checkSessionMock = jest.fn().mockResolvedValue(null);
const handleRedirectCallbackMock = jest.fn().mockResolvedValue(null);
const isConnectedMock = jest.fn().mockResolvedValue(false);
const getUserMock = jest.fn().mockResolvedValue(null);
const getIdTokenMock = jest.fn().mockResolvedValue(null);
const buildAuthorizeUrlMock = jest.fn().mockResolvedValue(null);
const buildLogoutUrlMock = jest.fn().mockResolvedValue(null);
const connectSilentlyMock = jest.fn().mockResolvedValue(null);
const getTokenWithPopupMock = jest.fn().mockResolvedValue(null);

jest.mock('vue', () => {
  const originalModule = jest.requireActual('vue');
  return {
    __esModule: true,
    ...originalModule,
    inject: jest.fn().mockResolvedValue(null)
  };
});

jest.mock('@eartho/one-client-vue', () => {
  return {
    EarthoOne: jest.fn().mockImplementation(() => {
      return {
        checkSession: checkSessionMock,
        handleRedirectCallback: handleRedirectCallbackMock,
        connectWithRedirect: connectWithRedirectMock,
        connectWithPopup: connectWithPopupMock,
        logout: logoutMock,
        isConnected: isConnectedMock,
        getUser: getUserMock,
        getIdToken: getIdTokenMock,
        buildAuthorizeUrl: buildAuthorizeUrlMock,
        buildLogoutUrl: buildLogoutUrlMock,
        connectSilently: connectSilentlyMock,
        getTokenWithPopup: getTokenWithPopupMock
      };
    })
  };
});

describe('createEarthoOne', () => {
  it('should create a plugin', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });
    expect(plugin.install).toBeTruthy();
  });
});

describe('useEartho', () => {
  it('should call inject', async () => {
    const instance = {};
    (inject as jest.Mock).mockReturnValue(instance);
    const result = useEartho();
    expect(result).toBe(instance);
  });
});

describe('EarthoPlugin', () => {
  const savedLocation = window.location;
  const savedHistory = window.history;
  let replaceStateMock = jest.fn();
  let appMock: App<any>;

  beforeEach(() => {
    delete window.location;
    window.location = Object.assign(new URL('https://example.org'), {
      ancestorOrigins: '',
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn()
    }) as any;

    delete window.history;
    window.history = {
      replaceState: replaceStateMock
    } as any;

    isConnectedMock.mockResolvedValue(false);
    getUserMock.mockResolvedValue(null);
    getIdTokenMock.mockResolvedValue(null);
    connectWithRedirectMock.mockResolvedValue(null);
    connectWithPopupMock.mockResolvedValue(null);
    checkSessionMock.mockResolvedValue(null);

    appMock = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    jest.restoreAllMocks();
  });
  afterEach(() => {
    window.location = savedLocation;
    window.history = savedHistory;
  });

  it('should create a proxy on installation', async () => {
    const plugin = createEarthoOne({
      domain: 'domain 123',
      client_id: 'client id 123',
      foo: 'bar'
    });

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$eartho).toBeTruthy();
    expect(appMock.provide).toHaveBeenCalledWith(
      EARTHO_INJECTION_KEY,
      expect.anything()
    );
    expect(EarthoOne).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'domain 123',
        client_id: 'client id 123',
        foo: 'bar'
      })
    );
  });

  it('should call checkSession on installation', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    plugin.install(appMock);

    expect(checkSessionMock).toHaveBeenCalled();
    expect(handleRedirectCallbackMock).not.toHaveBeenCalled();
  });

  function flushPromises() {
    return new Promise(resolve => setTimeout(resolve));
  }

  it('should call handleRedirect callback on installation with code', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: '',
      skipRedirectCallback: false
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(3);

    expect(checkSessionMock).not.toHaveBeenCalled();
    expect(handleRedirectCallbackMock).toHaveBeenCalled();

    return flushPromises().then(() => {
      expect(replaceStateMock).toHaveBeenCalled();
    });
  });

  it('should not call handleRedirect callback when skipRedirectCallback is true', async () => {
    const plugin = createEarthoOne(
      {
        domain: '',
        client_id: ''
      },
      {
        skipRedirectCallback: true
      }
    );

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(3);

    expect(checkSessionMock).toHaveBeenCalled();
    expect(handleRedirectCallbackMock).not.toHaveBeenCalled();

    return flushPromises().then(() => {
      expect(replaceStateMock).not.toHaveBeenCalled();
    });
  });

  it('should not call handleRedirect callback on installation when no state', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(3);

    expect(checkSessionMock).toHaveBeenCalled();
    expect(handleRedirectCallbackMock).not.toHaveBeenCalled();

    return flushPromises().then(() => {
      expect(replaceStateMock).not.toHaveBeenCalled();
    });
  });

  it('should call handleRedirect callback on installation when error', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('error', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(3);

    expect(checkSessionMock).not.toHaveBeenCalled();
    expect(handleRedirectCallbackMock).toHaveBeenCalled();

    return flushPromises().then(() => {
      expect(replaceStateMock).toHaveBeenCalled();
    });
  });

  it('should call the router, if provided, with the target path', async () => {
    const routerPushMock = jest.fn();
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    appMock.config.globalProperties['$router'] = {
      push: routerPushMock
    };

    handleRedirectCallbackMock.mockResolvedValue({
      appState: {
        target: 'abc'
      }
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(routerPushMock).toHaveBeenCalledWith('abc');
    });
  });

  it('should call the router, if provided, with the default path when no target provided', async () => {
    const routerPushMock = jest.fn();
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    appMock.config.globalProperties['$router'] = {
      push: routerPushMock
    };

    handleRedirectCallbackMock.mockResolvedValue({
      appState: {}
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    return flushPromises().then(() => {
      expect(routerPushMock).toHaveBeenCalledWith('/');
    });
  });

  it('should proxy connectWithRedirect', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const loginOptions = {
      audience: 'audience 123'
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$eartho.connectWithRedirect(
      loginOptions
    );
    expect(connectWithRedirectMock).toHaveBeenCalledWith(loginOptions);
  });

  it('should proxy connectWithPopup', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const loginOptions = {
      audience: 'audience 123'
    };
    const popupOptions = {
      timeoutInSeconds: 60
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$eartho.connectWithPopup(
      loginOptions,
      popupOptions
    );
    expect(connectWithPopupMock).toHaveBeenCalledWith(loginOptions, popupOptions);
  });

  it('should proxy logout', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const logoutOptions = {
      localOnly: true,
      federated: true
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$eartho.logout(logoutOptions);
    expect(logoutMock).toHaveBeenCalledWith(logoutOptions);
  });

  it('should proxy logout without options', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    await appMock.config.globalProperties.$eartho.logout();
    expect(logoutMock).toHaveBeenCalledWith(undefined);
  });

  it('should update state after localOnly logout', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const logoutOptions = {
      localOnly: true
    };

    plugin.install(appMock);

    expect.assertions(4);
    await flushPromises();
    jest.clearAllMocks();

    await appMock.config.globalProperties.$eartho.logout(logoutOptions);

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(getIdTokenMock).toHaveBeenCalledTimes(1);
    expect(isConnectedMock).toHaveBeenCalledTimes(1);
  });

  it('should not update state after logout', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    expect.assertions(4);
    await flushPromises();
    jest.clearAllMocks();

    await appMock.config.globalProperties.$eartho.logout();

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(getUserMock).not.toHaveBeenCalled();
    expect(getIdTokenMock).not.toHaveBeenCalled();
    expect(isConnectedMock).not.toHaveBeenCalled();
  });

  it('should proxy connectSilently', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    const getTokenOptions = {
      scope: 'a b c'
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$eartho.connectSilently(
      getTokenOptions
    );
    expect(connectSilentlyMock).toHaveBeenCalledWith(getTokenOptions);
  });

  it('should proxy getAccessTokenWithPopup', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    const getTokenOptions = { scope: 'a b c' };
    const popupOptions = { timeoutInSeconds: 20 };

    plugin.install(appMock);

    await appMock.config.globalProperties.$eartho.getAccessTokenWithPopup(
      getTokenOptions,
      popupOptions
    );
    expect(getTokenWithPopupMock).toHaveBeenCalledWith(
      getTokenOptions,
      popupOptions
    );
  });

  it('should proxy buildAuthorizeUrl', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const loginOptions = {
      localOnly: true,
      federated: true
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$eartho.buildAuthorizeUrl(
      loginOptions
    );
    expect(buildAuthorizeUrlMock).toHaveBeenCalledWith(loginOptions);
  });

  it('should proxy buildLogoutUrl', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const logoutUrlOptions = {
      localOnly: true,
      federated: true
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$eartho.buildLogoutUrl(
      logoutUrlOptions
    );
    expect(buildLogoutUrlMock).toHaveBeenCalledWith(logoutUrlOptions);
  });

  it('should be loading by default', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$eartho.isLoading.value).toBe(true);
  });

  it('should not be loading once the SDK is finished', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$eartho.isLoading.value).toBe(
        false
      );
    });
  });

  it('should set isConnected to false when not authenticated', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$eartho.isConnected.value).toBe(
        false
      );
    });
  });

  it('should set isConnected to true when authenticated', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    isConnectedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$eartho.isConnected.value).toBe(
        true
      );
    });
  });

  it('should set user to null when not authenticated', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    isConnectedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$eartho.user.value).toBe(null);
    });
  });

  it('should set user when authenticated', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const userMock = { name: 'john' };

    isConnectedMock.mockResolvedValue(true);
    getUserMock.mockResolvedValue(userMock);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$eartho.user.value).toStrictEqual(
        userMock
      );
    });
  });

  it('should set idToken to null when not authenticated', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    isConnectedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$eartho.idToken.value).toBe(
        null
      );
    });
  });

  it('should set idToken when authenticated', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    const idToken = { name: 'john' };

    isConnectedMock.mockResolvedValue(true);
    getIdTokenMock.mockResolvedValue(idToken);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(
        appMock.config.globalProperties.$eartho.idToken.value
      ).toStrictEqual(idToken);
    });
  });

  it('should track errors when connectWithPopup throws', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    connectWithPopupMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$eartho.connectWithPopup();
    } catch (e) { }

    expect(appMock.config.globalProperties.$eartho.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when logout throws', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    logoutMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$eartho.logout({
        localOnly: true
      });
    } catch (e) { }

    expect(appMock.config.globalProperties.$eartho.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when getAccessTokenWithPopup throws', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    getTokenWithPopupMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$eartho.getAccessTokenWithPopup();
    } catch (e) { }

    expect(appMock.config.globalProperties.$eartho.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when connectSilently throws', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    connectSilentlyMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$eartho.connectSilently();
    } catch (e) { }

    expect(appMock.config.globalProperties.$eartho.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when checkSession throws', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    try {
      plugin.install(appMock);

      checkSessionMock.mockRejectedValue('Some Error');

      await appMock.config.globalProperties.$eartho.checkSession();
    } catch (e) { }

    expect(appMock.config.globalProperties.$eartho.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when handleRedirectCallback throws', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    handleRedirectCallbackMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$eartho.handleRedirectCallback();
    } catch (e) { }

    expect(appMock.config.globalProperties.$eartho.error.value).toEqual(
      'Some Error'
    );
  });

  it('should clear errors when successful', async () => {
    const plugin = createEarthoOne({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    handleRedirectCallbackMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$eartho.handleRedirectCallback();
    } catch (e) { }

    expect(appMock.config.globalProperties.$eartho.error.value).toEqual(
      'Some Error'
    );

    handleRedirectCallbackMock.mockResolvedValue({});

    await appMock.config.globalProperties.$eartho.handleRedirectCallback();

    expect(appMock.config.globalProperties.$eartho.error.value).toBeFalsy();
  });
});
