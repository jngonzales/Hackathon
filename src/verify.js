import { bootstrapProject } from "./runtime/bootstrap.js";
import { buildVerificationReport } from "./verification/build-verification-report.js";

const configPath = process.env.APP_CONFIG_PATH;

bootstrapProject({ configPath })
  .then((project) => buildVerificationReport(project))
  .then((report) => {
    console.log(JSON.stringify(report, null, 2));
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
