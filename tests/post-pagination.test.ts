import assert from "node:assert/strict"
import { test } from "node:test"

import {
  getPostPageHref,
  getPostPageParams,
  getTotalPostPages,
  parsePostPage,
} from "../lib/post-pagination"

test("Generates pages of six posts and keeps a homepage for an empty list", () => {
  for (const count of [0, 1, 6]) {
    assert.equal(getTotalPostPages(count), 1)
    assert.deepEqual(getPostPageParams(count), [{ pagination: [] }])
  }
  for (const count of [7, 12]) {
    assert.deepEqual(getPostPageParams(count), [
      { pagination: [] },
      { pagination: ["page", "2"] },
    ])
  }
  assert.deepEqual(getPostPageParams(13), [
    { pagination: [] },
    { pagination: ["page", "2"] },
    { pagination: ["page", "3"] },
  ])
})

test("Builds and parses page URLs and rejects duplicate homepages and invalid paths", () => {
  assert.equal(getPostPageHref(1), "/")
  assert.equal(getPostPageHref(2), "/page/2")
  assert.equal(parsePostPage(), 1)
  assert.equal(parsePostPage([]), 1)
  assert.equal(parsePostPage(["page", "2"]), 2)
  assert.equal(parsePostPage(["page", "10"]), 10)

  for (const segments of [
    ["page"],
    ["page", "1"],
    ["page", "0"],
    ["page", "-1"],
    ["page", "02"],
    ["page", "2.5"],
    ["page", "2e1"],
    ["page", "9007199254740992"],
    ["page", "2", "extra"],
    ["other", "2"],
  ]) {
    assert.equal(parsePostPage(segments), undefined)
  }
})
