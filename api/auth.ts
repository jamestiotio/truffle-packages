import {
  getCookie,
  setCookie,
} from "https://tfl.dev/@truffle/utils@~0.0.2/cookie/cookie.ts";
import isSsr from "https://tfl.dev/@truffle/utils@~0.0.22/ssr/is-ssr.ts";
import jumper from "https://tfl.dev/@truffle/utils@~0.0.3/jumper/jumper.ts";
import { signal } from "https://tfl.dev/@truffle/state@~0.0.12/signals/signal.ts";
import { _clearCache } from "./client.ts";
import { TRUFFLE_ACCESS_TOKEN_KEY } from "./auth-exchange.ts";
import { default as globalContext } from "https://tfl.dev/@truffle/global-context@^1.0.0/index.ts";

const ACCESS_TOKEN_COOKIE = "accessToken";

const onAccessTokenChangeListeners = {};
const accessToken$ = signal(getAccessToken());

if (!isSsr) {
  jumper.call(
    "user.onAccessTokenChange",
    { orgId: getOrgId() },
    ({ accessToken }) => {
      setAccessTokenCookie(accessToken);
      _clearCache();
      Object.values(onAccessTokenChangeListeners).forEach((listener) =>
        listener?.(accessToken)
      );
    },
  );

  // TODO: legacy, rm 4/2023
  jumper.call("comms.onMessage", (message: string) => {
    getAccessToken().then(accessToken$.set);
    if (message === "user.accessTokenUpdated") {
      _clearCache();
    }
  });
  // end legacy
}

export function onAccessTokenChange(
  callback: (accessToken: string) => unknown,
): { unsubscribe: () => void } {
  const id = `${Date.now()}${Math.random()}`;
  onAccessTokenChangeListeners[id] = callback;

  return {
    unsubscribe: () => {
      delete onAccessTokenChangeListeners[id];
    },
  };
}

export async function getAccessToken(): Promise<string> {
  // we need to rely on jumper first bc we can't trust that third party cookies will be set.
  // for ssr this is a little trickier... ssr obj can't use jumper. so for ssr we
  let accessTokenFromJumper = !isSsr &&
    await jumper.call("user.getAccessToken", {
      // we'll eventually have different accessTokens per orgId
      orgId: getOrgId(),
    });
  // TODO: legacy, rm 4/2023
  if (!accessTokenFromJumper && !isSsr) {
    accessTokenFromJumper = await jumper.call("storage.get", {
      key: TRUFFLE_ACCESS_TOKEN_KEY,
    });
  }
  // end legacy
  return accessTokenFromJumper || getCookie(ACCESS_TOKEN_COOKIE);
}

export function getAccessToken$() {  
  return accessToken$;
}

export function setAccessToken(
  accessToken: string,
  { orgId }: { orgId?: string } = {},
) {
  if (accessToken == null) {
    return console.warn("Attempting to set nullish accessToken");
  }

  setAccessTokenCookie(accessToken);
  _clearCache();
  // set accessToken in highest possible storage we have, and notify anyone
  // listening for accessToken changes
  jumper.call("user.setAccessToken", {
    // we'll eventually have different accessTokens per orgId
    orgId: orgId || getOrgId(),
    accessToken,
  });

  // FIXME: legacy, rm 4/2023 (extension doesn't have user.setAccessToken setup properly in <=3.3.12)
  jumper.call("storage.set", {
    key: TRUFFLE_ACCESS_TOKEN_KEY,
    value: accessToken,
  });
  jumper.call("comms.postMessage", "user.accessTokenUpdated");
  // end legacy
}

export function setAccessTokenCookie(accessToken: string) {
  accessToken$.set(accessToken);
  setCookie(ACCESS_TOKEN_COOKIE, accessToken, {});
}

export function setOrgId(orgId: string) {
  const context = globalContext.getStore() || {};

  globalContext.setGlobalValue({
    ...context,
    orgId,
  });
}

function getOrgId() {
  const context = globalContext.getStore() || {};

  return context.orgId;
}

// DEPRECATED, remove 3/2023
export function _setAccessTokenAndClear(accessToken: string) {
  console.warn("_setAccessTokenAndClear is deprecated");
  setAccessToken(accessToken);
  _clearCache();
}
