import {
  useComputed,
  useMemo,
  useQuery,
  useSignal,
  useUpdateSignalOnChange,
  useUrqlQuerySignal,
} from "../../../deps.ts";
import { OrgUserConnections } from "../../../types/mod.ts";
import { ORG_USER_CONNECTIONS_QUERY, USER_INFO_QUERY } from "./gql.ts";

export function useUserInfo() {
  const [{ data: userInfoData, error }, reexecuteUserInfoQuery] = useQuery({
    query: USER_INFO_QUERY,
    context: useMemo(
      () => ({
        additionalTypenames: [
          "OwnedCollectible",
          "CollectibleConnection",
          "Collectible",
          "ActivePowerup",
          "OrgUserCounterType",
          "OrgUserCounter",
        ],
      }),
      [],
    ),
  });

  console.log("use user info", userInfoData);

  return { userInfoData, reexecuteUserInfoQuery, error };
}

export function useOrgUserConnectionsQuery() {
  const orgUser$ = useSignal<{ orgUser: OrgUserConnections }>(undefined!);

  const { signal$: orgUserData$, reexecuteQuery: refetchOrgUserConnections } =
    useUrqlQuerySignal(
      ORG_USER_CONNECTIONS_QUERY,
    );
  useUpdateSignalOnChange(orgUser$, orgUserData$.data);

  // want signal to be ready immediately, so can't seem to use orgUserData$.fetching directly
  const fetching$ = useComputed(() => orgUserData$.get()?.fetching);

  return {
    orgUser$,
    fetching$,
    refetchOrgUserConnections,
  };
}
