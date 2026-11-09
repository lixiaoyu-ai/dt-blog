import assert from "node:assert/strict"
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { test, type TestContext } from "node:test"

import {
  getPostAssetUrl,
  getPostImagePaths,
  getPostMarkdownImageUrl,
  readPostImage,
} from "../lib/post-assets"

async function fixture(t: TestContext) {
  const root = await mkdtemp(path.join(os.tmpdir(), "dt-blog-images-"))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(path.join(root, "images"))
  await writeFile(
    path.join(root, "cover.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg"/>'
  )
  return root
}

test("文章图片的相对路径和中文文件名生成稳定的访问地址", () => {
  assert.equal(
    getPostAssetUrl("my-post", "./cover.svg"),
    "/posts/my-post/assets/cover.svg"
  )
  assert.equal(
    getPostAssetUrl("my-post", "./images/配图.svg"),
    `/posts/my-post/assets/images/${encodeURIComponent("配图.svg")}`
  )
  for (const value of [
    "../cover.svg",
    "/images/cover.svg",
    "./chart-data.json",
    "./images/../../cover.png",
    "./cover.svg?raw",
  ]) {
    assert.throws(() => getPostAssetUrl("my-post", value), /相对路径/)
  }
})

test("读取文章目录内的图片，文件内容变化时更新缓存标识", async (t) => {
  const root = await fixture(t)
  const image = await readPostImage(root, ["cover.svg"])
  assert.equal(image?.contentType, "image/svg+xml")
  assert.match(image?.data.toString() ?? "", /<svg/)
  assert.equal((await readPostImage(root, ["cover.svg"]))?.etag, image?.etag)

  await writeFile(
    path.join(root, "cover.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>'
  )
  assert.notEqual((await readPostImage(root, ["cover.svg"]))?.etag, image?.etag)

  await writeFile(path.join(root, "images", "配图.svg"), "<svg/>")
  assert.equal(
    (await readPostImage(root, ["images", "配图.svg"]))?.data.toString(),
    "<svg/>"
  )
})

test("Markdown 图片路径只编码一次，保留中文、空格与文件名中的百分号", () => {
  assert.equal(
    getPostMarkdownImageUrl("my-post", "./images/%E9%85%8D%E5%9B%BE%201.svg"),
    getPostAssetUrl("my-post", "./images/配图 1.svg")
  )
  assert.equal(
    getPostMarkdownImageUrl("my-post", "./images/100%25.svg"),
    getPostAssetUrl("my-post", "./images/100%.svg")
  )
  assert.equal(
    getPostMarkdownImageUrl("my-post", "./images/100%done.svg"),
    getPostAssetUrl("my-post", "./images/100%done.svg")
  )
  assert.throws(
    () => getPostMarkdownImageUrl("my-post", "./%2E%2E/cover.svg"),
    /相对路径/
  )
})

test("资源读取拒绝越界路径、正文和数据文件", async (t) => {
  const root = await fixture(t)
  await writeFile(path.join(root, "index.mdx"), "private draft text")
  await writeFile(path.join(root, "chart-data.json"), "[]")
  for (const segments of [
    ["..", "cover.svg"],
    ["images/cover.svg"],
    ["index.mdx"],
    ["chart-data.json"],
    ["missing.png"],
  ]) {
    assert.equal(await readPostImage(root, segments), undefined)
  }
})

test("符号链接不能越过文章目录或将正文伪装成图片", async (t) => {
  const root = await fixture(t)
  const outside = await fixture(t)
  await symlink(path.join(outside, "cover.svg"), path.join(root, "outside.svg"))
  assert.equal(await readPostImage(root, ["outside.svg"]), undefined)

  await writeFile(path.join(root, "index.mdx"), "private draft text")
  await symlink(path.join(root, "index.mdx"), path.join(root, "source.svg"))
  assert.equal(await readPostImage(root, ["source.svg"]), undefined)
})

test("静态导出只收集真实图片，跳过正文、数据、隐藏文件和符号链接", async (t) => {
  const root = await fixture(t)
  const outside = await fixture(t)
  await mkdir(path.join(root, ".private"))
  await writeFile(path.join(root, ".private", "hidden.svg"), "<svg/>")
  await writeFile(path.join(root, ".hidden.svg"), "<svg/>")
  await writeFile(path.join(root, "images", "配图.svg"), "<svg/>")
  await writeFile(path.join(root, "index.mdx"), "draft text")
  await writeFile(path.join(root, "chart-data.json"), "[]")
  await symlink(path.join(outside, "cover.svg"), path.join(root, "outside.svg"))
  await symlink(outside, path.join(root, "linked-images"))

  const images = await getPostImagePaths(root)
  assert.deepEqual(images, [["cover.svg"], ["images", "配图.svg"]])
  for (const assetPath of images) {
    assert(await readPostImage(root, assetPath))
  }
})
