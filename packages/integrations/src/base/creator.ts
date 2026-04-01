import type { IntegrationKind } from "@homarr/definitions";

import type { Integration, IntegrationInput } from "./integration";

export const createIntegrationAsync = async <TKind extends keyof typeof integrationCreatorsDefinition>(
  integration: IntegrationInput & { kind: TKind },
) => {
  if (!(integration.kind in integrationCreators)) {
    throw new Error(
      `Unknown integration kind ${integration.kind}. Did you forget to add it to the integration creator?`,
    );
  }

  const importCreator = integrationCreatorsDefinition[integration.kind];
  const creator = await importCreator();

  // factories are an array, to differentiate in js between class constructors and functions
  if (Array.isArray(creator)) {
    return (await creator[0](integration)) as IntegrationInstanceOfKind<TKind>;
  }

  return new creator(integration) as IntegrationInstanceOfKind<TKind>;
};

type IntegrationInstance = new (integration: IntegrationInput) => Integration;

// Each entry is a lazy thunk that dynamically imports the integration module on first use.
// This avoids eagerly loading all ~45 integration modules (and their heavy transitive
// dependencies like Jellyfin SDK, Octokit, GitBeaker, Immich SDK, etc.) at startup,
// saving 100-200 MiB of heap per Node.js process.
// factories are an array, to differentiate in js between class constructors and functions
const integrationCreatorsDefinition = {
  piHole: () =>
    import("../pi-hole/pi-hole-integration-factory").then((m): [typeof m.createPiHoleIntegrationAsync] => [
      m.createPiHoleIntegrationAsync,
    ]),
  adGuardHome: () => import("../adguard-home/adguard-home-integration").then((m) => m.AdGuardHomeIntegration),
  homeAssistant: () => import("../homeassistant/homeassistant-integration").then((m) => m.HomeAssistantIntegration),
  jellyfin: () => import("../jellyfin/jellyfin-integration").then((m) => m.JellyfinIntegration),
  plex: () => import("../plex/plex-integration").then((m) => m.PlexIntegration),
  sonarr: () => import("../media-organizer/sonarr/sonarr-integration").then((m) => m.SonarrIntegration),
  radarr: () => import("../media-organizer/radarr/radarr-integration").then((m) => m.RadarrIntegration),
  sabNzbd: () => import("../download-client/sabnzbd/sabnzbd-integration").then((m) => m.SabnzbdIntegration),
  nzbGet: () => import("../download-client/nzbget/nzbget-integration").then((m) => m.NzbGetIntegration),
  qBittorrent: () =>
    import("../download-client/qbittorrent/qbittorrent-integration").then((m) => m.QBitTorrentIntegration),
  deluge: () => import("../download-client/deluge/deluge-integration").then((m) => m.DelugeIntegration),
  transmission: () =>
    import("../download-client/transmission/transmission-integration").then((m) => m.TransmissionIntegration),
  slskd: () => import("../download-client/slskd/slskd-integration").then((m) => m.SlskdIntegration),
  aria2: () => import("../download-client/aria2/aria2-integration").then((m) => m.Aria2Integration),
  jellyseerr: () => import("../jellyseerr/jellyseerr-integration").then((m) => m.JellyseerrIntegration),
  seerr: () => import("../seerr/seerr-integration").then((m) => m.SeerrIntegration),
  overseerr: () => import("../overseerr/overseerr-integration").then((m) => m.OverseerrIntegration),
  prowlarr: () => import("../prowlarr/prowlarr-integration").then((m) => m.ProwlarrIntegration),
  openmediavault: () => import("../openmediavault/openmediavault-integration").then((m) => m.OpenMediaVaultIntegration),
  lidarr: () => import("../media-organizer/lidarr/lidarr-integration").then((m) => m.LidarrIntegration),
  readarr: () => import("../media-organizer/readarr/readarr-integration").then((m) => m.ReadarrIntegration),
  dashDot: () => import("../dashdot/dashdot-integration").then((m) => m.DashDotIntegration),
  tdarr: () => import("../media-transcoding/tdarr-integration").then((m) => m.TdarrIntegration),
  proxmox: () => import("../proxmox/proxmox-integration").then((m) => m.ProxmoxIntegration),
  emby: () => import("../emby/emby-integration").then((m) => m.EmbyIntegration),
  nextcloud: () => import("../nextcloud/nextcloud.integration").then((m) => m.NextcloudIntegration),
  unifiController: () =>
    import("../unifi-controller/unifi-controller-integration").then((m) => m.UnifiControllerIntegration),
  opnsense: () => import("../opnsense/opnsense-integration").then((m) => m.OPNsenseIntegration),
  github: () => import("../github/github-integration").then((m) => m.GithubIntegration),
  dockerHub: () => import("../docker-hub/docker-hub-integration").then((m) => m.DockerHubIntegration),
  gitlab: () => import("../gitlab/gitlab-integration").then((m) => m.GitlabIntegration),
  npm: () => import("../npm/npm-integration").then((m) => m.NPMIntegration),
  codeberg: () => import("../codeberg/codeberg-integration").then((m) => m.CodebergIntegration),
  linuxServerIO: () => import("../linuxserverio/linuxserverio-integration").then((m) => m.LinuxServerIOIntegration),
  gitHubContainerRegistry: () =>
    import("../github-container-registry/github-container-registry-integration").then(
      (m) => m.GitHubContainerRegistryIntegration,
    ),
  ical: () => import("../ical/ical-integration").then((m) => m.ICalIntegration),
  quay: () => import("../quay/quay-integration").then((m) => m.QuayIntegration),
  ntfy: () => import("../ntfy/ntfy-integration").then((m) => m.NTFYIntegration),
  mock: () => import("../mock/mock-integration").then((m) => m.MockIntegration),
  truenas: () => import("../truenas/truenas-integration").then((m) => m.TrueNasIntegration),
  unraid: () => import("../unraid/unraid-integration").then((m) => m.UnraidIntegration),
  coolify: () => import("../coolify/coolify-integration").then((m) => m.CoolifyIntegration),
  tracearr: () => import("../tracearr/tracearr-integration").then((m) => m.TracearrIntegration),
  glances: () => import("../glances/glances-integration").then((m) => m.GlancesIntegration),
  immich: () => import("../immich/immich-integration").then((m) => m.ImmichIntegration),
};

// Compile-time check: every IntegrationKind has a corresponding lazy creator
export const integrationCreators: Record<IntegrationKind, () => Promise<unknown>> &
  typeof integrationCreatorsDefinition = integrationCreatorsDefinition;

type ResolvedCreator<TKind extends keyof typeof integrationCreatorsDefinition> = Awaited<
  ReturnType<(typeof integrationCreatorsDefinition)[TKind]>
>;

type IntegrationInstanceOfKind<TKind extends keyof typeof integrationCreatorsDefinition> = {
  [kind in TKind]: ResolvedCreator<kind> extends [(input: IntegrationInput) => Promise<infer R>]
    ? R
    : ResolvedCreator<kind> extends IntegrationInstance
      ? InstanceType<ResolvedCreator<kind>>
      : never;
}[TKind];
