export default function KidAvatar({ kid, size = 'md' }) {
  const initials = (kid?.name ?? '?').trim().slice(0, 2).toUpperCase()
  return (
    <div className={`kid-avatar ${size === 'lg' ? 'lg' : ''}`} style={{ background: kid?.avatar_color || '#facc15' }}>
      {initials}
    </div>
  )
}
