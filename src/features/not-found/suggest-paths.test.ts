import { suggestPaths } from "@features/not-found/suggest-paths";
import { describe, expect, it } from "vite-plus/test";

const pages = [
  "/",
  "/about",
  "/blog",
  "/contact",
  "/cv",
  "/developers",
  "/graphics",
  "/music",
  "/photography",
  "/privacy",
  "/vignettes",
];

describe("suggestPaths", () => {
  it("suggests the section for a nested path", () => {
    expect(suggestPaths("/blog/old-post", pages)).toEqual(["/blog"]);
  });

  it("suggests the blog for a dead post URL", () => {
    expect(suggestPaths("/posts/old-post", pages)).toEqual(["/blog"]);
  });

  it("suggests the blog for a dead tag URL", () => {
    expect(suggestPaths("/tags/astro", pages)).toEqual(["/blog"]);
  });

  it("recovers a typo", () => {
    expect(suggestPaths("/blogg", pages)).toEqual(["/blog"]);
  });

  it("recovers a case mismatch", () => {
    expect(suggestPaths("/Photography/", pages)).toEqual(["/photography"]);
  });

  it("returns nothing for an unrelated path", () => {
    expect(suggestPaths("/zzzz", pages)).toEqual([]);
  });

  it("returns nothing for the home page", () => {
    expect(suggestPaths("/", pages)).toEqual([]);
  });

  it("ignores a path that exists", () => {
    expect(suggestPaths("/blog", pages)).toEqual([]);
  });

  it("does not throw on malformed encoding", () => {
    expect(suggestPaths("/%E0%A4%A", pages)).toEqual([]);
  });
});
