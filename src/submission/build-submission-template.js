function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function ensureSocialLinks(value) {
  const entries = asArray(value).slice(0, 5);
  while (entries.length < 5) {
    entries.push("");
  }
  return entries;
}

export function buildSubmissionTemplate(config) {
  const title = asString(config.submission.projectTitle);
  const shortDescription = asString(config.submission.shortDescription);
  const description = asString(config.submission.description);
  const track = asString(config.submission.track);
  const technologies = asArray(config.submission.technologies);
  const imageLink = asString(config.submission.media.coverImage);
  const videoLink = asString(config.submission.media.demoVideo);
  const presentationLink = asString(config.submission.media.presentation);

  return {
    eventName: asString(config.submission.eventName),
    track,
    basicInformation: {
      title,
      shortDescription,
      description,
      submissionType: asString(config.submission.submissionType),
      categories: asArray(config.submission.categories),
      tracks: asArray(config.submission.tracks).length > 0 ? asArray(config.submission.tracks) : [track].filter(Boolean),
      technologies,
      socialMediaPosts: ensureSocialLinks(config.submission.socialMediaPosts)
    },
    media: {
      imageLink,
      videoLink,
      presentationLink,
      assets: {
        coverImage: {
          reference: imageLink,
          status: imageLink ? "ready" : "missing"
        },
        demoVideo: {
          reference: videoLink,
          status: videoLink ? "ready" : "missing"
        },
        presentation: {
          reference: presentationLink,
          status: presentationLink ? "ready" : "missing"
        }
      }
    },
    application: {
      repoLink: asString(config.submission.repoUrl),
      demoPlatform: asString(config.submission.demoPlatform),
      demoUrl: asString(config.submission.demoUrl),
      additionalInfo: asString(config.submission.additionalInfo)
    },
    narrative: {
      elevatorPitch: asString(config.submission.narrative?.elevatorPitch)
        || shortDescription
        || `${title} is a bounded AI trading agent built for the ${track || "hackathon"} track.`,
      problemStatement: asString(config.submission.narrative?.problemStatement)
        || "Financial agents need bounded execution, transparent evidence, and clear reviewability to be trusted.",
      solutionSummary: asString(config.submission.narrative?.solutionSummary)
        || `${title} combines market-driven execution, risk gating, and linked validation artifacts for a single-trackable trading workflow.`,
      demoFlow: asArray(config.submission.narrative?.demoFlow).length > 0
        ? asArray(config.submission.narrative?.demoFlow)
        : [
            "Show market snapshot ingestion and strategy evaluation.",
            "Show risk approval or rejection before execution.",
            "Show execution result and linked validation artifacts.",
            "Show reviewer trace and submission readiness report."
          ],
      differentiators: asArray(config.submission.narrative?.differentiators).length > 0
        ? asArray(config.submission.narrative?.differentiators)
        : [
            "Bounded execution path with explicit no-trade outcomes.",
            "Linked decision, risk, execution, and validation records.",
            "Submission-ready artifact structure for combined-track review."
          ]
    },
    presentation: {
      deckReference: presentationLink,
      outline: asArray(config.submission.presentation?.outline).length > 0
        ? asArray(config.submission.presentation?.outline)
        : [
            "Problem and trust requirements",
            "System architecture and bounded agent loop",
            "Strategy, risk controls, and execution path",
            "Validation artifacts and reviewer traceability",
            "Demo flow and next steps"
          ]
    },
    hackathonCompliance: {
      earlySurge: {
        registered: Boolean(config.submission.hackathonCompliance?.earlySurge?.registered),
        projectUrl: asString(config.submission.hackathonCompliance?.earlySurge?.projectUrl)
      },
      kraken: {
        buildInPublicLinks: asArray(config.submission.hackathonCompliance?.kraken?.buildInPublicLinks),
        readOnlyAuditReady: Boolean(config.submission.hackathonCompliance?.kraken?.readOnlyAuditReady),
        executionAdapter: asString(config.execution.adapter),
        marketDataMode: "snapshot-ingest"
      },
      erc8004: {
        identityRegistry: asString(config.agent.identityRegistry),
        identityRegistered: Boolean(config.submission.hackathonCompliance?.erc8004?.identityRegistered),
        reputationTrackingEnabled: Boolean(config.submission.hackathonCompliance?.erc8004?.reputationTrackingEnabled),
        capitalSandboxEnabled: Boolean(config.submission.hackathonCompliance?.erc8004?.capitalSandboxEnabled),
        riskRouterEnabled: Boolean(config.submission.hackathonCompliance?.erc8004?.riskRouterEnabled)
      }
    },
    krakenVerification: {
      apiKey: asString(config.submission.krakenVerification.apiKey),
      accountId: asString(config.submission.krakenVerification.accountId)
    }
  };
}
