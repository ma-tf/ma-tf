export type JobKind = "screen" | "export";

export type JobTracker = {
  begin: (kind: JobKind, job: number) => void;
  reset: (job: number) => void;
  isCurrent: (kind: JobKind, job: number) => boolean;
};

export function createJobTracker(): JobTracker {
  const latest: Record<JobKind, number> = { screen: 0, export: 0 };
  return {
    begin: (kind, job) => {
      latest[kind] = Math.max(latest[kind], job);
    },
    reset: (job) => {
      latest.screen = Math.max(latest.screen, job);
      latest.export = Math.max(latest.export, job);
    },
    isCurrent: (kind, job) => latest[kind] === job,
  };
}
