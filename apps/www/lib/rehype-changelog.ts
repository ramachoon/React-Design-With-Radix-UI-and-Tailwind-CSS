import fs from "fs"
import path from "path"
import { GitCommit, UnistNode, UnistTree } from "@/types/unist"
import * as git from "isomorphic-git"
import { visit } from "unist-util-visit"

export async function rehypeChangelog(tree: UnistTree) {
  const nodes: UnistNode[] = []
  visit(tree, (node: UnistNode) => {
    if (node.name === "ComponentHistory") {
      nodes.push(node)
    }
  })

  if (nodes?.length) {
    const [node] = nodes
    const src = node.attributes?.find((attribute) => attribute.name === "src")
      ?.value as string

    if (src) {
      const componentFilePath = path.join("apps/www", src)
      const history = await getFileHistory(componentFilePath)

      node.attributes?.push({
        name: "history",
        type: "mdxJsxAttribute",
        value: {
          type: "mdxJsxAttribute",
          value: `${JSON.stringify(history)}`,
          data: {
            estree: {
              type: "Program",
              sourceType: "module",
              body: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "ArrayExpression",
                    elements: history.map((commit) => ({
                      type: "ObjectExpression",
                      properties: [
                        createMdxProperty("timestamp", commit?.timestamp),
                        createMdxProperty("message", commit?.message),
                        createMdxProperty("commit", commit?.id),
                        createMdxProperty("url", commit?.url),
                      ],
                    })),
                  },
                },
              ],
            },
          },
        },
      })
    }
  }

  return tree
}

async function getFileHistory(filepath: string): Promise<GitCommit[]> {
  const logs = await git.log({
    fs,
    dir: path.resolve(process.cwd(), "../.."),
    ref: "main",
    filepath,
  })

  return logs.map(function (log) {
    return {
      id: log.oid,
      message: log.commit.message.split("\n")[0],
      timestamp: log.commit.author.timestamp * 1000,
      url: `https://github.com/shadcn/ui/commit/${log.oid}`,
    }
  })
}

function createMdxProperty(indentifier: string, value: string | number) {
  return {
    type: "Property",
    key: {
      type: "Identifier",
      name: indentifier,
    },
    value: {
      type: "Literal",
      value: value,
    },
    computed: false,
    method: false,
    shorthand: false,
    kind: "init",
  }
}
