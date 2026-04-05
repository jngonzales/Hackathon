import { mkdir } from "node:fs/promises";

export async function ensureWorkspace(storageConfig) {
  const directories = [
    storageConfig.rootDir,
    storageConfig.recordsDir,
    storageConfig.artifactsDir,
    storageConfig.submissionDir
  ];

  for (const directory of directories) {
    await mkdir(directory, { recursive: true });
  }

  return {
    rootDir: storageConfig.rootDir,
    recordsDir: storageConfig.recordsDir,
    artifactsDir: storageConfig.artifactsDir,
    submissionDir: storageConfig.submissionDir
  };
}
