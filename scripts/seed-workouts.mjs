#!/usr/bin/env node
/**
 * Seed workouts into Supabase from the local JSON files.
 * Run once with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-workouts.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

function loadJSON(filename) {
  const path = resolve(__dirname, filename)
  return JSON.parse(readFileSync(path, 'utf-8'))
}

const DROPPED_FIELDS = new Set([
  'track', 'energy_system', 'movement_patterns', 'avoid_after',
  'rotation', 'sub_format', 'workout_number',
])

function mapWorkout(raw) {
  const row = {
    legacy_id: raw.id,
    name: raw.name,
    title: raw.title || '',
    category: raw.category,
    format: raw.format || null,
    sections: raw.sections || {},
    scaling: raw.scaling || null,
    excerpt: raw.excerpt || null,
    equipment: raw.equipment || [],
    duration_minutes: raw.duration_minutes || null,
    intensity: raw.intensity || null,
    notes: raw.notes || null,
    created_by: null,
    is_public: true,
    is_seed: true,
  }
  return row
}

async function main() {
  const conditioning = loadJSON('conditioning.json')
  const metcon = loadJSON('metcon.json')
  const accessory = loadJSON('accessory.json')
  const all = [...conditioning, ...metcon, ...accessory]

  console.log(`Seeding ${all.length} workouts...`)

  const rows = all.map(mapWorkout)

  const { data, error } = await supabase
    .from('workouts')
    .upsert(rows, { onConflict: 'legacy_id' })
    .select('id, legacy_id')

  if (error) {
    console.error('Upsert failed:', error)
    process.exit(1)
  }

  console.log(`Upserted ${data.length} workouts:`)
  data.forEach(r => console.log(`  ${r.legacy_id} -> ${r.id}`))
  console.log('Done.')
}

main()
