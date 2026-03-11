'use client'

type Props = {
  completed: number
  total: number
}

/** プログレスバー（完了数/合計） */
export const ProgressBar = ({ completed, total }: Props) => {
  const pct = total > 0 ? (completed / total) * 100 : 0

  return (
    <div
      style={{
        background: '#C8E6C9',
        borderRadius: 20,
        height: 20,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          height: '100%',
          borderRadius: 20,
          background: 'linear-gradient(90deg, #2ED573, #6BCB77, #A8E6CF)',
          backgroundSize: '200% auto',
          animation: completed > 0 ? 'shimmerBar 2s linear infinite' : 'none',
          width: `${pct}%`,
          transition: 'width 0.6s ease',
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontSize: 10,
          fontWeight: 900,
          color: pct > 45 ? '#fff' : '#2D3142',
        }}
      >
        {completed} / {total}
      </div>
    </div>
  )
}
