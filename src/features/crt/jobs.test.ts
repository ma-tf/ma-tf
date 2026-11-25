import { createJobTracker } from "@features/crt/jobs";
import { describe, expect, it } from "vite-plus/test";

describe("createJobTracker", () => {
  it("treats only the latest job of a kind as current", () => {
    const jobs = createJobTracker();
    jobs.begin("screen", 1);
    jobs.begin("screen", 2);

    expect(jobs.isCurrent("screen", 1)).toBe(false);
    expect(jobs.isCurrent("screen", 2)).toBe(true);
  });

  it("keeps screen and export jobs apart", () => {
    const jobs = createJobTracker();
    jobs.begin("export", 3);
    jobs.begin("screen", 4);

    expect(jobs.isCurrent("export", 3)).toBe(true);
    expect(jobs.isCurrent("screen", 4)).toBe(true);
  });

  it("makes every earlier job stale on reset", () => {
    const jobs = createJobTracker();
    jobs.begin("screen", 1);
    jobs.begin("export", 2);
    jobs.reset(3);

    expect(jobs.isCurrent("screen", 1)).toBe(false);
    expect(jobs.isCurrent("export", 2)).toBe(false);
    expect(jobs.isCurrent("screen", 3)).toBe(true);
  });

  it("ignores a job that arrives out of order", () => {
    const jobs = createJobTracker();
    jobs.begin("screen", 5);
    jobs.begin("screen", 4);

    expect(jobs.isCurrent("screen", 5)).toBe(true);
    expect(jobs.isCurrent("screen", 4)).toBe(false);
  });
});
