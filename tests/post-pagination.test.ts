import assert from "node:assert/strict"
import { test } from "node:test"

import {
  getPostPageHref,
  getPostPageParams,
  getTotalPostPages,
  parsePostPage,
} from "../lib/post-pagination"

test("根据每页六篇文章生成静态分页，空列表仍生成首页", () => {
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

test("页码路径、首页链接与解析结果一致，拒绝重复首页和无效路径", () => {
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
