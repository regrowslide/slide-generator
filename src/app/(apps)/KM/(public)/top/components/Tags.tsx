'use client'

import { Kaizen } from '@app/(apps)/KM/class/Kaizen'

interface TagsProps {
  work: any
  isHeader?: boolean
}

export const Tags = ({ work, isHeader = false }: TagsProps) => {
  const jobTags = Kaizen.KaizenWork.parseTags(work.jobCategory).flat()
  const systemTags = Kaizen.KaizenWork.parseTags(work.systemCategory).flat()
  const toolTags = Kaizen.KaizenWork.parseTags(work.collaborationTool).flat()

  if (isHeader) {
    return (
      <>
        {jobTags.map((tag, idx) => (
          <span
            key={`job-${idx}`}
            className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-sm border border-white/30"
          >
            🏢 {tag}
          </span>
        ))}
        {systemTags.map((tag, idx) => (
          <span
            key={`sys-${idx}`}
            className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-sm border border-white/30"
          >
            🔧 {tag}
          </span>
        ))}
        {toolTags.map((tag, idx) => (
          <span
            key={`tool-${idx}`}
            className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-sm border border-white/30"
          >
            🔗 {tag}
          </span>
        ))}
      </>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {jobTags.map((tag, idx) => (
        <span
          key={`job-${idx}`}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm border border-emerald-200"
        >
          🏢 {tag}
        </span>
      ))}
      {systemTags.map((tag, idx) => (
        <span
          key={`sys-${idx}`}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 text-xs font-bold text-purple-700 shadow-sm border border-purple-200"
        >
          🔧 {tag}
        </span>
      ))}
      {toolTags.map((tag, idx) => (
        <span
          key={`tool-${idx}`}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm border border-blue-200"
        >
          🔗 {tag}
        </span>
      ))}
    </div>
  )
}
