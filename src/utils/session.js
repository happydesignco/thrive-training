// Sessions: a day's workout as blocks of items, in the same plain-text
// format Adam Boyd writes in Apple Notes:
//
//   Squat 531
//   Chin ups 3x10
//
//   Bench 531
//   Split squat 3x8 each leg
//
//   Dips 3x10
//   GHD sit ups 3x10
//
// Blank lines separate blocks. "<Lift> 531" pulls in the 5/3/1 sets.

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const LIFT_ALIASES = [
  ['squat', /^(back\s+)?squats?$/i],
  ['bench', /^bench(\s+press)?$/i],
  ['deadlift', /^(deadlifts?|dl)$/i],
  ['press', /^(ohp|press|overhead\s+press|military\s+press)$/i],
]

export const LIFT_TEXT = { squat: 'Squat', bench: 'Bench', deadlift: 'Deadlift', press: 'OHP' }

const DAY_HEADER = /^(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)[a-z]*\.?:?$/i
const DAY_PREFIX = { mon: 'monday', tue: 'tuesday', wed: 'wednesday', thu: 'thursday', fri: 'friday', sat: 'saturday', sun: 'sunday' }

function liftKeyFor(name) {
  const found = LIFT_ALIASES.find(([, re]) => re.test(name.trim()))
  return found ? found[0] : null
}

export function parseItem(line) {
  const text = line.trim()

  const lift = text.match(/^(.+?)\s+5\s*\/?\s*3\s*\/?\s*1\+?$/i)
  if (lift) {
    const key = liftKeyFor(lift[1])
    if (key) return { text, lift: key }
  }

  const sr = text.match(/^(.+?)\s+(\d+)\s*[x×]\s*(\d+(?:\s*-\s*\d+)?)\s*(.*)$/i)
  if (sr) {
    return {
      text,
      name: sr[1].trim(),
      sets: Number(sr[2]),
      reps: sr[3].replace(/\s/g, ''),
      ...(sr[4] ? { note: sr[4].trim() } : {}),
    }
  }

  return { text }
}

function parseBlocks(lines) {
  const blocks = []
  let current = []
  for (const raw of lines) {
    if (!raw.trim()) {
      if (current.length) blocks.push({ items: current })
      current = []
      continue
    }
    current.push(parseItem(raw))
  }
  if (current.length) blocks.push({ items: current })
  return blocks
}

export function sessionKind(session) {
  const items = session.blocks.flatMap(b => b.items)
  if (items.some(i => i.lift || i.sets)) return 'lift'
  return 'conditioning'
}

export function parseSession(text) {
  const blocks = parseBlocks(text.split(/\r?\n/))
  if (!blocks.length) return null
  const session = { blocks }
  session.kind = sessionKind(session)
  return session
}

// Parse a pasted note. Returns { days: { monday: session, ... } } when the
// text has day headers, or { single: session } when it doesn't.
export function parseNote(text) {
  const lines = text.split(/\r?\n/)
  const days = {}
  let day = null
  let buf = []
  let sawHeader = false

  const flush = () => {
    if (day && buf.some(l => l.trim())) {
      const s = parseSession(buf.join('\n'))
      if (s) days[day] = s
    }
    buf = []
  }

  for (const line of lines) {
    const m = line.trim().match(DAY_HEADER)
    if (m) {
      flush()
      day = DAY_PREFIX[m[1].slice(0, 3).toLowerCase()]
      sawHeader = true
      continue
    }
    buf.push(line)
  }
  flush()

  if (sawHeader) return { days }
  const single = parseSession(text)
  return single ? { single } : { days: {} }
}

export function serializeSession(session) {
  return session.blocks
    .map(b => b.items.map(i => i.text).join('\n'))
    .join('\n\n')
}

export function itemKey(item) {
  if (item.lift) return `lift:${item.lift}`
  const name = (item.name || item.text).toLowerCase()
  return name.replace(/[^a-z0-9]+/g, ' ').trim()
}

// ---------------------------------------------------------------------------
// Default lift days, built from the pairings Boyd has used Aug–Oct 2026.
// Each main lift gets a partner that doesn't compete with it:
//   squat → upper-body pull or curl     bench → single-leg work
//   deadlift → row                      press → posterior chain / upper back
// The finisher follows the day: push/arms/core with squat+bench,
// shoulder health/upper back with deadlift+press.

const ex = (text, pattern) => ({ ...parseItem(text), pattern })

const AUX = {
  squat: [
    ex('Chin ups 3x10', 'vertical-pull'),
    ex('Lat pull downs 3x8', 'vertical-pull'),
    ex('DB hammer curls 3x8', 'curl'),
    ex('DB spider curls 3x10', 'curl'),
  ],
  bench: [
    ex('Split squat 3x8 each leg', 'single-leg-squat'),
    ex('Heavy DB lunges 3x8 each leg', 'single-leg-squat'),
    ex('Box step ups 3x8 each leg', 'single-leg-squat'),
    ex('Elevated DB reverse lunges 3x8 each leg', 'single-leg-squat'),
  ],
  deadlift: [
    ex('DB rows 3x8 each arm', 'row'),
    ex('Cable rows 3x10', 'row'),
  ],
  press: [
    ex('KB Jefferson curls 3x10', 'spine-flexion'),
    ex('Single leg DB RDL 3x8 each leg', 'single-leg-hinge'),
    ex('Band pull aparts 3x10', 'rear-delt'),
  ],
}

const FINISHERS = {
  push: [
    ex('Dips 3x10', 'dip'),
    ex('DB incline bench 3x10', 'incline'),
    ex('Cable chest flys 3x10', 'fly'),
    ex('Tricep ext 3x10', 'triceps'),
    ex('GHD sit ups 3x10', 'core'),
    ex('Pushups 3x15', 'pushup'),
    ex('Heavy DB pullovers 3x10', 'pullover'),
  ],
  shoulder: [
    ex('Inverted Cuban press 3x10', 'cuban'),
    ex('DB crossover raises 3x10', 'raise'),
    ex('Band pull aparts 3x10', 'rear-delt'),
    ex('Scap pull ups 3x10', 'scap'),
    ex('YMCA 30 seconds each way', 'ymca'),
    ex('GHD sit ups 3x10', 'core'),
    ex('Single arm DB OHP 3x10', 'db-press'),
  ],
}

// Deload: no barbell. Each lift becomes a light dumbbell version of itself.
const DELOAD_SUB = {
  squat: ex('Light DB split squat 3x10 each leg', 'deload-squat'),
  bench: ex('DB bench 3x10', 'deload-bench'),
  deadlift: ex('Light single leg DB RDL 3x10 each leg', 'deload-hinge'),
  press: ex('Light seated single arm DB OHP 3x10', 'deload-press'),
}

// "Split squat" clashes with "Light DB split squat" even though the
// patterns differ, so compare the bare exercise names too.
function bare(text) {
  return text.toLowerCase().replace(/\b(light|heavy|db|kb|elevated|seated)\b/g, '')
    .replace(/\d+\s*x\s*\d+.*$/, '').replace(/\s+/g, ' ').trim()
}

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function strip({ pattern, ...item }) { return item }

function pick(pool, seed, used, chosen) {
  for (let i = 0; i < pool.length; i++) {
    const cand = pool[(seed + i) % pool.length]
    const name = bare(cand.text)
    if (!used.has(cand.pattern) && !chosen.some(t => bare(t).includes(name))) {
      used.add(cand.pattern)
      return cand
    }
  }
  return null
}

// liftKeys: e.g. ['squat', 'bench']. seedStr: week + day, so everyone sees the
// same defaults for a given day. shuffle bumps the seed for a different mix.
export function generateLiftSession(liftKeys, { seedStr = '', shuffle = 0, deload = false } = {}) {
  const seed = hash(`${seedStr}:${shuffle}`)
  const used = new Set()
  const blocks = []

  const chosen = deload ? liftKeys.map(k => DELOAD_SUB[k].text) : []

  liftKeys.forEach((key, i) => {
    const main = deload ? strip(DELOAD_SUB[key]) : { text: `${LIFT_TEXT[key]} 531`, lift: key }
    const aux = pick(AUX[key], seed + i * 3, used, chosen)
    if (aux) chosen.push(aux.text)
    blocks.push({ items: aux ? [main, strip(aux)] : [main] })
  })

  const theme = liftKeys.some(k => k === 'deadlift' || k === 'press') ? 'shoulder' : 'push'
  const finisher = []
  for (let n = 0; n < 3; n++) {
    const f = pick(FINISHERS[theme], seed + 11 + n * 2, used, chosen)
    if (f) { chosen.push(f.text); finisher.push(strip(f)) }
  }
  if (finisher.length) blocks.push({ items: finisher })

  return { kind: 'lift', blocks, generated: true }
}

export const DEFAULT_LIFT_DAYS = {
  monday: ['squat', 'bench'],
  friday: ['deadlift', 'press'],
}

export function e1rm(weight, reps) {
  const w = parseFloat(weight)
  const r = parseInt(reps, 10)
  if (!w || !r) return null
  return Math.round(w * r * 0.0333 + w)
}
