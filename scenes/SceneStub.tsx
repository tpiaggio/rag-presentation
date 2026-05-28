type Props = { id: string; title: string }

export default function SceneStub({ id, title }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-2 text-center">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          {id}
        </div>
        <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
        <p className="text-[var(--color-muted)]">
          Placeholder · usa ← y → para navegar, Cmd+. para notas
        </p>
      </div>
    </div>
  )
}
