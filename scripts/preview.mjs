import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"

const directory = path.resolve("out")
const port = Number(process.env.BLOG_PREVIEW_PORT ?? 4173)
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

try {
  await stat(path.join(directory, "index.html"))
} catch {
  console.error("找不到 out/index.html，请先运行 pnpm build。")
  process.exit(1)
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end()
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname
    )
  } catch {
    response.writeHead(400).end()
    return
  }

  let filename = path.resolve(directory, `.${pathname}`)
  if (
    filename !== directory &&
    !filename.startsWith(`${directory}${path.sep}`)
  ) {
    response.writeHead(404).end()
    return
  }

  try {
    if ((await stat(filename)).isDirectory()) {
      filename = path.join(filename, "index.html")
    }
    const data = await readFile(filename)
    response.writeHead(200, {
      "Content-Type":
        contentTypes[path.extname(filename).toLowerCase()] ??
        "application/octet-stream",
      "Content-Length": data.length,
    })
    response.end(request.method === "HEAD" ? undefined : data)
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      const html = await readFile(path.join(directory, "404.html")).catch(
        () => "404"
      )
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
      response.end(request.method === "HEAD" ? undefined : html)
    } else {
      console.error(error)
      response.writeHead(500).end()
    }
  }
})

server.listen(port, "127.0.0.1", () => {
  console.log(`静态预览：http://localhost:${port}`)
})
