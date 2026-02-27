import { useState } from 'react'

const MOVEMENTS = [
  {
    name: 'SkiErg',
    open: { solo: '1000m', partner: '500m' },
    pro: { solo: '1000m', partner: '1000m' },
  },
  {
    name: 'Sled Push',
    open: { solo: '50m — Men: 152kg · Women: 102kg', partner: '25m — Men: 152kg · Women: 102kg' },
    pro: { solo: '50m — Men: 202kg · Women: 152kg', partner: '25m — Men: 202kg · Women: 152kg' },
  },
  {
    name: 'Sled Pull',
    open: { solo: '50m — Men: 103kg · Women: 78kg', partner: '25m — Men: 103kg · Women: 78kg' },
    pro: { solo: '50m — Men: 153kg · Women: 103kg', partner: '25m — Men: 153kg · Women: 103kg' },
  },
  {
    name: 'Burpee Broad Jumps',
    open: { solo: '80m', partner: '40m' },
    pro: { solo: '80m', partner: '40m' },
  },
  {
    name: 'Row',
    open: { solo: '1000m', partner: '500m' },
    pro: { solo: '1000m', partner: '500m' },
  },
  {
    name: 'Farmers Carry',
    open: { solo: '200m — Men: 2×24kg · Women: 2×16kg', partner: '100m — Men: 2×24kg · Women: 2×16kg' },
    pro: { solo: '200m — Men: 2×32kg · Women: 2×24kg', partner: '100m — Men: 2×32kg · Women: 2×24kg' },
  },
  {
    name: 'Sandbag Lunges',
    open: { solo: '100m — Men: 20kg · Women: 10kg', partner: '50m — Men: 20kg · Women: 10kg' },
    pro: { solo: '100m — Men: 30kg · Women: 20kg', partner: '50m — Men: 30kg · Women: 20kg' },
  },
  {
    name: 'Wall Balls',
    open: { solo: '100 reps — Men: 14lb / 10ft · Women: 9lb / 9ft', partner: '50 reps — Men: 14lb / 10ft · Women: 9lb / 9ft' },
    pro: { solo: '100 reps — Men: 20lb / 10ft · Women: 14lb / 9ft', partner: '50 reps — Men: 20lb / 10ft · Women: 14lb / 9ft' },
  },
]

export default function Roulette() {
  const [division, setDivision] = useState('open')
  const [partner, setPartner] = useState(true)
  const [animalStyle, setAnimalStyle] = useState(false)
  const [result, setResult] = useState(null)
  const [visible, setVisible] = useState(true)

  function hitMe() {
    setVisible(false)
    setTimeout(() => {
      const idx = Math.floor(Math.random() * MOVEMENTS.length)
      const movement = MOVEMENTS[idx]
      const format = partner ? 'partner' : 'solo'
      const details = movement[division][format]
      const weightVest = animalStyle && Math.random() < 0.25

      setResult({ name: movement.name, details, weightVest })
      setVisible(true)
    }, 200)
  }

  return (
    <div className="max-w-[760px] mx-auto text-center">
      <h2 className="text-xl mb-6">HYROX Roulette</h2>

      <div className="text-left mb-8 text-sm">
        <p className="mb-2">Run as a timed AMRAP, or complete all 8 (randomized) stations. You pick.</p>
        <ul className="list-none max-w-[14em]">
          <li><span className="text-cyan opacity-80"> → Run</span></li>
          <li> → Click "HIT ME"</li>
          <li> → Complete the station</li>
          <li> → <span className="text-magenta opacity-80">REPEAT</span></li>
        </ul>
        <p className="text-xs mt-2 opacity-60">If you've already done the station, hit the button again. Or not.</p>
        <p className="text-xs text-cyan opacity-80 mt-1">
          Run 1000m to simulate a full HYROX. Use 500m to increase station density within the same time window.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-8 md:grid md:grid-cols-2 md:gap-4 text-left">
        <label className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-wider opacity-60">Division</span>
          <select
            value={division}
            onChange={e => setDivision(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-input-bg font-mono"
          >
            <option value="open">Open</option>
            <option value="pro">Pro</option>
          </select>
        </label>

        <label className="flex items-center md:col-span-2">
          <input
            type="checkbox"
            checked={partner}
            onChange={e => setPartner(e.target.checked)}
            className="thrive-checkbox"
          />
          Partner Format (half volume)
        </label>

        <label className="flex items-center md:col-span-2">
          <input
            type="checkbox"
            checked={animalStyle}
            onChange={e => setAnimalStyle(e.target.checked)}
            className="thrive-checkbox"
          />
          Animal Style
        </label>
      </div>

      {/* Result area */}
      <div className="border-2 border-magenta p-10 flex flex-col items-center">
        <h3
          className="text-4xl font-bold leading-tight transition-all duration-250"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {result ? result.name : 'Ready?'}
        </h3>

        <p
          className="text-lg opacity-85 mt-2 min-h-[1.6rem] transition-all duration-250"
          style={{
            opacity: visible ? 0.85 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {result?.details}
        </p>

        {result?.weightVest && (
          <span className="block mt-4 px-4 py-2 bg-magenta text-white text-lg">
            ANIMAL STYLE
          </span>
        )}

        <button
          onClick={hitMe}
          className="mt-8 py-2 px-8 bg-black border border-white text-white uppercase tracking-wider font-mono cursor-pointer hover:bg-magenta transition-colors"
        >
          Hit Me
        </button>
      </div>
    </div>
  )
}
