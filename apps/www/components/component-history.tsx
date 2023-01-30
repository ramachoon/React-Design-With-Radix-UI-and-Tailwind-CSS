"use client"

import * as React from "react"
import Link from "next/link"
import { GitCommit } from "@/types/unist"

import { formatDate } from "@/lib/utils"

interface ComponentHistoryProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string
  history: GitCommit[]
}

export function ComponentHistory({ history }: ComponentHistoryProps) {
  return (
    <div className="space-y-4 pt-6 pb-12">
      {history.map((commit) => (
        <div
          key={commit.id}
          className="relative flex items-center justify-between text-sm text-slate-500 dark:text-slate-400"
        >
          <Link
            href={commit?.url}
            target="_blank"
            rel="noreferrer"
            className="relative underline underline-offset-4 hover:text-slate-900 dark:hover:text-slate-100"
          >
            {commit.message}
          </Link>
          <hr className="mx-2 mt-3 flex-1 border border-dashed border-slate-200 dark:border-slate-800" />
          {commit.timestamp && (
            <div className="text-xs">{formatDate(commit.timestamp)}</div>
          )}
        </div>
      ))}
    </div>
  )
}
