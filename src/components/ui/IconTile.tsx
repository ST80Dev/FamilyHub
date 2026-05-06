import type { HTMLAttributes, ReactNode } from 'react'

export type IconTileTone =
  | 'peach'
  | 'mint'
  | 'sky'
  | 'lemon'
  | 'lilac'
  | 'pink'

type Size = 'sm' | 'md' | 'lg'

interface Props extends HTMLAttributes<HTMLDivElement> {
  tone?: IconTileTone
  size?: Size
  inset?: boolean
  children: ReactNode
}

const tones: Record<IconTileTone, string> = {
  peach: 'candy-peach-grad',
  mint: 'candy-mint-grad',
  sky: 'candy-sky-grad',
  lemon: 'candy-lemon-grad',
  lilac: 'candy-lilac-grad',
  pink: 'candy-pink-grad',
}

const sizes: Record<Size, string> = {
  sm: 'w-9 h-9 text-base rounded-xl',
  md: 'w-[46px] h-[46px] text-xl rounded-2xl',
  lg: 'w-[54px] h-[54px] text-[26px] rounded-[18px]',
}

export function IconTile({
  tone = 'peach',
  size = 'lg',
  inset = false,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <div
      {...rest}
      className={`grid place-items-center text-[color:var(--candy-ink)] ${tones[tone]} ${sizes[size]} ${inset ? 'clay-inset' : 'clay-sm'} ${className}`}
    >
      {children}
    </div>
  )
}
