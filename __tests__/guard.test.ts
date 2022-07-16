import { App, ref } from 'vue';
import { EarthoVueClient, authGuard, createAuthGuard } from '../src/index';
import { EARTHO_TOKEN } from '../src/token';
import { client } from './../src/plugin';

let watchEffectMock;

jest.mock('vue', () => {
  return {
    ...(jest.requireActual('vue') as any),
    watchEffect: function (cb) {
      watchEffectMock = cb;
      return () => { };
    }
  };
});

jest.mock('./../src/plugin', () => {
  return {
    ...(jest.requireActual('./../src/plugin') as any),
    client: ref({
      connectWithRedirect: jest.fn().mockResolvedValue({}),
      isConnected: ref(false),
      isLoading: ref(false)
    })
  };
});

describe('createAuthGuard', () => {
  let appMock: App<any>;
  let earthoMock: Partial<EarthoVueClient> = {
    connectWithRedirect: jest.fn().mockResolvedValue({}),
    isConnected: ref(false),
    isLoading: ref(false)
  };

  beforeEach(() => {
    earthoMock.isConnected.value = false;
    earthoMock.isLoading.value = false;
    appMock = {
      config: {
        globalProperties: {
          [EARTHO_TOKEN]: earthoMock
        }
      }
    } as any as App<any>;
  });

  it('should create the guard', async () => {
    const guard = createAuthGuard(appMock);
    expect(guard).toBeDefined();
    expect(typeof guard).toBe('function');
  });

  it('should wait untill isLoading is false', async () => {
    const guard = createAuthGuard(appMock);

    earthoMock.isLoading.value = true;

    expect.assertions(4);

    guard({
      fullPath: 'abc'
    } as any).then(() => {
      expect(true).toBeTruthy();
    });

    expect(earthoMock.connectWithRedirect).not.toHaveBeenCalled();

    earthoMock.isLoading.value = false;

    expect(earthoMock.connectWithRedirect).not.toHaveBeenCalled();

    await watchEffectMock();

    expect(earthoMock.connectWithRedirect).toHaveBeenCalled();
  });

  it('should return true when authenticated', async () => {
    const guard = createAuthGuard(appMock);

    earthoMock.isConnected.value = true;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(earthoMock.connectWithRedirect).not.toHaveBeenCalled();
  });

  it('should call connectWithRedirect', async () => {
    const guard = createAuthGuard(appMock);

    expect.assertions(1);

    await guard({
      fullPath: 'abc'
    } as any);

    expect(earthoMock.connectWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { target: 'abc' }
      })
    );
  });
});
describe('authGuard', () => {
  let earthoMock;

  beforeEach(() => {
    client.value.isConnected = false as any;
    client.value.isLoading = false as any;
    earthoMock = client.value;
  });

  it('should wait untill isLoading is false', async () => {
    const guard = authGuard;

    earthoMock.isLoading = true;

    expect.assertions(4);

    guard({
      fullPath: 'abc'
    } as any).then(() => {
      expect(true).toBeTruthy();
    });

    expect(earthoMock.connectWithRedirect).not.toHaveBeenCalled();

    earthoMock.isLoading = false;

    expect(earthoMock.connectWithRedirect).not.toHaveBeenCalled();

    await watchEffectMock();

    expect(earthoMock.connectWithRedirect).toHaveBeenCalled();
  });

  it('should return true when authenticated', async () => {
    const guard = authGuard;

    earthoMock.isConnected = true;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(earthoMock.connectWithRedirect).not.toHaveBeenCalled();
  });

  it('should call connectWithRedirect', async () => {
    const guard = authGuard;

    expect.assertions(1);

    await guard({
      fullPath: 'abc'
    } as any);

    expect(earthoMock.connectWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { target: 'abc' }
      })
    );
  });
});
