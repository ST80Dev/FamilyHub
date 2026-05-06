import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui'

interface Props {
  title: string
  icon: string
  description: string
}

export default function Placeholder({ title, icon, description }: Props) {
  return (
    <AppShell>
      <div className="md:mt-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          {title}
        </h1>
      </div>
      <Card variant="surface" padding="lg" radius="xl" className="mt-6 text-center">
        <div className="text-4xl" aria-hidden>{icon}</div>
        <h2 className="font-display mt-2 text-xl font-bold text-ink">
          In arrivo nelle prossime PR
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{description}</p>
      </Card>
    </AppShell>
  )
}
