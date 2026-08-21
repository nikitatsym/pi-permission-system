/** Adds `registry.getProvider`, which @mzwing/pi-permission-auto-review needs and omp's ModelRegistry lacks. */
import { streamSimple } from "@earendil-works/pi-ai";

interface RegistryModel {
  provider: string;
}

interface PatchableRegistry {
  getProvider?: (providerId: string) => unknown;
  hasProvider: (providerId: string) => boolean;
  getAll: () => RegistryModel[];
}

function isPatchableRegistry(value: unknown): value is PatchableRegistry {
  if (value === null || typeof value !== "object") return false;
  const candidate = value as Partial<PatchableRegistry>;
  return (
    typeof candidate.hasProvider === "function" &&
    typeof candidate.getAll === "function"
  );
}

/** Idempotent: patches only a registry that is missing getProvider. */
export function patchOmpModelRegistry(ctx: {
  modelRegistry?: unknown;
}): void {
  const registry = ctx.modelRegistry;
  if (!isPatchableRegistry(registry)) return;
  if (typeof registry.getProvider === "function") return;
  registry.getProvider = (providerId: string) => {
    if (!registry.hasProvider(providerId)) return undefined;
    return {
      getModels: () =>
        registry.getAll().filter((model) => model.provider === providerId),
      streamSimple,
    };
  };
}
