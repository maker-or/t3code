import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EnvironmentId, ServerProviderSkill } from "@t3tools/contracts";

import { readEnvironmentApi } from "./environmentApi";
import { discoverLocalProviderSkills, mergeProviderSkills } from "./providerSkillDiscovery.core";

export function useMergedProviderSkills(input: {
  environmentId: EnvironmentId;
  cwd: string | undefined;
  providerSkills: ReadonlyArray<ServerProviderSkill>;
}): ReadonlyArray<ServerProviderSkill> {
  const shouldDiscoverLocally = input.providerSkills.length === 0;
  const localSkillsQuery = useQuery({
    queryKey: ["providerSkillsDiscovery", input.environmentId, input.cwd ?? null],
    queryFn: async () => {
      const api = readEnvironmentApi(input.environmentId);
      if (!api) {
        return [] as ServerProviderSkill[];
      }
      return discoverLocalProviderSkills(api, input.cwd);
    },
    enabled: Boolean(input.environmentId) && shouldDiscoverLocally,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(
    () => mergeProviderSkills(input.providerSkills, localSkillsQuery.data ?? []),
    [input.providerSkills, localSkillsQuery.data],
  );
}
