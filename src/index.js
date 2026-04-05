import { bootstrapProject } from "./runtime/bootstrap.js";

const configPath = process.env.APP_CONFIG_PATH;

bootstrapProject({ configPath })
  .then((project) => {
    console.log("Project scaffold ready.");
    console.log(`Execution mode: ${project.config.execution.mode}`);
    console.log(`Workspace: ${project.workspace.rootDir}`);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
