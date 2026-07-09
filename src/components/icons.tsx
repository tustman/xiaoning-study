import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

/* ===== 课程分类图标 ===== */
export function AiIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 8V4M9 2h6" />
      <circle cx="9" cy="13" r="1" />
      <circle cx="15" cy="13" r="1" />
      <path d="M9.5 16h5" />
    </svg>
  )
}

export function EnvIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </svg>
  )
}

export function FeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18M8 18v2M16 18v2" />
      <path d="m9 13 2-2 2 2 2-2" />
    </svg>
  )
}

export function BeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  )
}

export function PayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="17" cy="12" r="1.4" />
      <path d="M2 10h20" />
    </svg>
  )
}

export function ProjectIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10l8-6 8 6v10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

export function CourseIcon({
  type,
  ...props
}: IconProps & { type: 'ai' | 'env' | 'fe' | 'be' | 'pay' | 'project' }) {
  switch (type) {
    case 'ai':
      return <AiIcon {...props} />
    case 'env':
      return <EnvIcon {...props} />
    case 'fe':
      return <FeIcon {...props} />
    case 'be':
      return <BeIcon {...props} />
    case 'pay':
      return <PayIcon {...props} />
    case 'project':
      return <ProjectIcon {...props} />
  }
}

/* ===== 课程特色图标 ===== */
export function FriendlyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5s1.5 2 3.5 2 3.5-2 3.5-2" />
      <circle cx="9" cy="10" r="0.6" fill="currentColor" />
      <circle cx="15" cy="10" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function CaseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M12 12v3M10.5 13.5h3" />
    </svg>
  )
}

export function CursorIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 4 5 20l3-1.5 1.5 3L12 18l3 1-3-8z" />
      <path d="M14 14l6 1-3 1.5L16 20l-1-4z" />
    </svg>
  )
}

export function FullstackIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="16" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
      <path d="M8 7h8M8 17h8" />
    </svg>
  )
}

export function GroupIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5h16v10H9l-4 4V5z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  )
}

export function UpdateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 11a8 8 0 0 0-14-4.5L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14 4.5L20 16" />
      <path d="M20 20v-4h-4" />
    </svg>
  )
}

export function FeatureIcon({
  type,
  ...props
}: IconProps & { type: 'friendly' | 'project' | 'cursor' | 'fullstack' | 'group' | 'update' }) {
  switch (type) {
    case 'friendly':
      return <FriendlyIcon {...props} />
    case 'project':
      return <CaseIcon {...props} />
    case 'cursor':
      return <CursorIcon {...props} />
    case 'fullstack':
      return <FullstackIcon {...props} />
    case 'group':
      return <GroupIcon {...props} />
    case 'update':
      return <UpdateIcon {...props} />
  }
}

/* ===== 通用 ===== */
export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2.5}>
      <path d="M5 12.5 10 17 19 7" />
    </svg>
  )
}

export function LogoGlyph(props: IconProps) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" {...props}>
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="15"
        fontWeight="900"
        fontFamily="'Noto Sans SC', sans-serif"
        fill="currentColor"
      >
        AI
      </text>
    </svg>
  )
}
