import os from "node:os";
import path from "node:path";

import { bootstrapProject } from "../src/runtime/bootstrap.js";
import { buildVerificationReport } from "../src/verification/build-verification-report.js";

async function createReport() {
  const storageRootDir = path.join(
    os.tmpdir(),
    `hackathon-trading-agent-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );

  const project = await bootstrapProject({ storageRootDir });
  return buildVerificationReport(project);
}

function writeNodeResponse(response, statusCode, payload) {
  response.status(statusCode).setHeader("content-type", "application/json; charset=utf-8");
  response.send(JSON.stringify(payload));
}

export default async function handler(_request, response) {
  try {
    const report = await createReport();

    if (response) {
      writeNodeResponse(response, 200, report);
      return;
    }

    return Response.json(report);
  } catch (error) {
    const payload = {
      error: error instanceof Error ? error.message : String(error)
    };

    if (response) {
      writeNodeResponse(response, 500, payload);
      return;
    }

    return Response.json(payload, { status: 500 });
  }
}

export async function GET() {
  try {
    const report = await createReport();
    return Response.json(report);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
