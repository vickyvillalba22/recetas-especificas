import { Icon } from '@iconify/react'

function HugeIcon({ icon, size = 24, strokeWidth: _strokeWidth, ...props }) {
  return <Icon icon={`hugeicons:${icon}`} width={size} height={size} {...props} />
}

export const BookHeart = (props) => <HugeIcon icon="book-02" {...props} />
export const Check = (props) => <HugeIcon icon="check" {...props} />
export const CirclePlus = (props) => <HugeIcon icon="add-circle" {...props} />
export const Clock3 = (props) => <HugeIcon icon="clock-01" {...props} />
export const Copy = (props) => <HugeIcon icon="copy-01" {...props} />
export const Leaf = (props) => <HugeIcon icon="organic-food" {...props} />
export const ListChecks = (props) => <HugeIcon icon="list-checks" {...props} />
export const Menu = (props) => <HugeIcon icon="menu-01" {...props} />
export const Moon = (props) => <HugeIcon icon="moon-01" {...props} />
export const Plus = (props) => <HugeIcon icon="add-01" {...props} />
export const Sparkles = (props) => <HugeIcon icon="sparkles" {...props} />
export const Sun = (props) => <HugeIcon icon="sun-01" {...props} />
export const X = (props) => <HugeIcon icon="cancel-01" {...props} />
