import { buildSubmissionTemplate } from "./build-submission-template.js";

function hasValue(value) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasValue(item));
  }

  return value !== null && value !== undefined;
}

function setNestedValue(target, path, value) {
  const segments = path.split(".");
  let current = target;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index];
    current[key] ??= {};
    current = current[key];
  }

  current[segments.at(-1)] = value;
}

function getNestedValue(target, path) {
  return path.split(".").reduce((value, segment) => value?.[segment], target);
}

function mergeManifest(template, manifest = {}) {
  return {
    eventName: manifest.eventName ?? template.eventName,
    track: manifest.track ?? template.track,
    basicInformation: {
      ...template.basicInformation,
      ...manifest.basicInformation,
      categories: Array.isArray(manifest.basicInformation?.categories)
        ? manifest.basicInformation.categories
        : template.basicInformation.categories,
      tracks: Array.isArray(manifest.basicInformation?.tracks)
        ? manifest.basicInformation.tracks
        : template.basicInformation.tracks,
      technologies: Array.isArray(manifest.basicInformation?.technologies)
        ? manifest.basicInformation.technologies
        : template.basicInformation.technologies,
      socialMediaPosts: Array.isArray(manifest.basicInformation?.socialMediaPosts)
        ? manifest.basicInformation.socialMediaPosts
        : template.basicInformation.socialMediaPosts
    },
    media: {
      ...template.media,
      ...manifest.media,
      assets: {
        ...template.media.assets,
        ...manifest.media?.assets
      }
    },
    application: {
      ...template.application,
      ...manifest.application
    },
    narrative: {
      ...template.narrative,
      ...manifest.narrative,
      demoFlow: Array.isArray(manifest.narrative?.demoFlow)
        ? manifest.narrative.demoFlow
        : template.narrative.demoFlow,
      differentiators: Array.isArray(manifest.narrative?.differentiators)
        ? manifest.narrative.differentiators
        : template.narrative.differentiators
    },
    presentation: {
      ...template.presentation,
      ...manifest.presentation,
      outline: Array.isArray(manifest.presentation?.outline)
        ? manifest.presentation.outline
        : template.presentation.outline
    },
    hackathonCompliance: {
      earlySurge: {
        ...template.hackathonCompliance.earlySurge,
        ...manifest.hackathonCompliance?.earlySurge
      },
      kraken: {
        ...template.hackathonCompliance.kraken,
        ...manifest.hackathonCompliance?.kraken,
        buildInPublicLinks: Array.isArray(manifest.hackathonCompliance?.kraken?.buildInPublicLinks)
          ? manifest.hackathonCompliance.kraken.buildInPublicLinks
          : template.hackathonCompliance.kraken.buildInPublicLinks
      },
      erc8004: {
        ...template.hackathonCompliance.erc8004,
        ...manifest.hackathonCompliance?.erc8004
      }
    },
    krakenVerification: {
      ...template.krakenVerification,
      ...manifest.krakenVerification
    }
  };
}

function includesTrack(trackList, track) {
  return Array.isArray(trackList) && trackList.includes(track);
}

export class SubmissionManifest {
  constructor(store, config) {
    this.store = store;
    this.template = buildSubmissionTemplate(config);
  }

  async read() {
    const manifest = await this.store.read();
    return mergeManifest(this.template, manifest);
  }

  async save(nextManifest) {
    return this.store.write(mergeManifest(this.template, nextManifest));
  }

  async prepareDraft(overrides = {}) {
    const manifest = await this.read();
    const prepared = mergeManifest(this.template, {
      ...manifest,
      ...overrides
    });

    return this.save(prepared);
  }

  async evaluateReadiness() {
    const manifest = await this.read();
    const requiredFields = [
      ["basicInformation.title", "Project title"],
      ["basicInformation.shortDescription", "Short description"],
      ["basicInformation.description", "Full description"],
      ["application.repoLink", "Repository link"],
      ["application.demoPlatform", "Demo platform"],
      ["application.demoUrl", "Demo URL"],
      ["media.imageLink", "Cover image link"],
      ["media.videoLink", "Demo video link"],
      ["media.presentationLink", "Presentation link"]
    ];
    const optionalFields = [
      ["basicInformation.submissionType", "Submission type"],
      ["basicInformation.categories", "Categories"],
      ["basicInformation.tracks", "Tracks"],
      ["basicInformation.technologies", "Technologies"],
      ["basicInformation.socialMediaPosts", "Social media posts"],
      ["application.additionalInfo", "Additional info"],
      ["krakenVerification.apiKey", "Kraken API key"],
      ["krakenVerification.accountId", "Kraken account ID"]
    ];
    const trackList = manifest.basicInformation.tracks ?? [];
    const hackathonRequirements = [
      {
        path: "hackathonCompliance.earlySurge.registered",
        label: "Project registered at early.surge.xyz",
        complete: manifest.hackathonCompliance?.earlySurge?.registered === true
      }
    ];

    if (includesTrack(trackList, "combined") || includesTrack(trackList, "kraken")) {
      hackathonRequirements.push(
        {
          path: "hackathonCompliance.kraken.buildInPublicLinks",
          label: "Public build progress link",
          complete: hasValue(manifest.hackathonCompliance?.kraken?.buildInPublicLinks)
        },
        {
          path: "hackathonCompliance.kraken.executionAdapter",
          label: "Kraken execution adapter configured",
          complete: String(manifest.hackathonCompliance?.kraken?.executionAdapter ?? "").toLowerCase() === "kraken-cli"
        }
      );
    }

    if (includesTrack(trackList, "combined") || includesTrack(trackList, "erc-8004")) {
      hackathonRequirements.push(
        {
          path: "hackathonCompliance.erc8004.identityRegistered",
          label: "ERC-8004 identity registered",
          complete: manifest.hackathonCompliance?.erc8004?.identityRegistered === true
        },
        {
          path: "hackathonCompliance.erc8004.reputationTrackingEnabled",
          label: "Reputation tracking enabled",
          complete: manifest.hackathonCompliance?.erc8004?.reputationTrackingEnabled === true
        },
        {
          path: "hackathonCompliance.erc8004.capitalSandboxEnabled",
          label: "Hackathon capital sandbox enabled",
          complete: manifest.hackathonCompliance?.erc8004?.capitalSandboxEnabled === true
        },
        {
          path: "hackathonCompliance.erc8004.riskRouterEnabled",
          label: "Risk router enabled",
          complete: manifest.hackathonCompliance?.erc8004?.riskRouterEnabled === true
        }
      );
    }

    const required = requiredFields.map(([path, label]) => ({
      path,
      label,
      complete: hasValue(getNestedValue(manifest, path))
    }));
    const optional = optionalFields.map(([path, label]) => ({
      path,
      label,
      complete: hasValue(getNestedValue(manifest, path))
    }));

    return {
      ready: required.every((item) => item.complete) && hackathonRequirements.every((item) => item.complete),
      checkedAt: new Date().toISOString(),
      required,
      optional,
      hackathonRequirements,
      missingRequired: required.filter((item) => !item.complete),
      missingHackathonRequirements: hackathonRequirements.filter((item) => !item.complete),
      missingOptional: optional.filter((item) => !item.complete),
      manifest
    };
  }

  async setAssetReference(assetName, reference) {
    const manifest = await this.read();
    const prepared = structuredClone(manifest);

    const assetFieldMap = {
      coverImage: "imageLink",
      demoVideo: "videoLink",
      presentation: "presentationLink"
    };
    const field = assetFieldMap[assetName];

    if (!field) {
      throw new Error(`Unsupported asset name: ${assetName}`);
    }

    setNestedValue(prepared, `media.${field}`, reference);
    setNestedValue(prepared, `media.assets.${assetName}.reference`, reference);
    setNestedValue(prepared, `media.assets.${assetName}.status`, reference ? "ready" : "missing");

    if (assetName === "presentation") {
      setNestedValue(prepared, "presentation.deckReference", reference);
    }

    return this.save(prepared);
  }
}
