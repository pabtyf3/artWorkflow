type BlenderInvocationRequest = {
  invocationId: string;
  mode: "headless" | "gui";
  scripts: Array<{
    prefabKey: string;
    blenderPython: string;
  }>;
  output?: {
    directory: string;
    format?: "blend" | "fbx" | "gltf";
  };
};

type BlenderInvocationResult = {
  invocationId: string;
  ok: boolean;
  executed: Array<{
    prefabKey: string;
    artefacts: string[];
  }>;
  errors?: Array<{
    prefabKey: string;
    message: string;
    stderr?: string;
  }>;
  warnings?: string[];
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

export const invokeBlenderStub = (
  request: BlenderInvocationRequest
): BlenderInvocationResult => {
  const warnings: string[] = [
    "Blender invocation stub used — no execution performed.",
  ];

  if (!isNonEmptyString(request.invocationId)) {
    return {
      invocationId: request.invocationId,
      ok: false,
      executed: [],
      warnings: ["Invalid invocationId; expected non-empty string."],
    };
  }

  if (request.mode !== "headless" && request.mode !== "gui") {
    return {
      invocationId: request.invocationId,
      ok: false,
      executed: [],
      warnings: [`Invalid mode "${request.mode}"; expected headless or gui.`],
    };
  }

  if (!Array.isArray(request.scripts)) {
    return {
      invocationId: request.invocationId,
      ok: false,
      executed: [],
      warnings: ["Invalid scripts list; expected array."],
    };
  }

  const executed = request.scripts.map((script) => ({
    prefabKey: script.prefabKey,
    artefacts: [
      `${script.prefabKey}::mock_mesh`,
      `${script.prefabKey}::mock_collection`,
    ],
  }));

  warnings.push(`Mode: ${request.mode}.`);
  warnings.push(`Scripts: ${request.scripts.length}.`);

  return {
    invocationId: request.invocationId,
    ok: true,
    executed,
    warnings,
  };
};
