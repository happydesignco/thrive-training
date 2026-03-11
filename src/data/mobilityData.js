export const sessions = {
  morning: [
    {
      phase: 'Release',
      phaseKey: 'release',
      exercises: [
        {
          name: '90/90 Hip Stretch',
          meta: '90s each side',
          duration: 90,
          sides: true,
          cue: 'Both knees at 90°. Lean gently over the front leg, spine long. Breathe out and let the hip sink on each exhale. Keep your back tall — don\'t round forward.',
        },
        {
          name: 'Kneeling Hip Flexor Stretch',
          meta: '60s each side',
          duration: 60,
          sides: true,
          cue: 'Kneel on one knee, lunge forward slightly. Tuck your tailbone under to feel the stretch in the front of the hip. Keep torso upright — resist the urge to lean forward.',
        },
        {
          name: 'Supine Figure-Four',
          meta: '60s each side',
          duration: 60,
          sides: true,
          cue: 'On your back, ankle crossed over the opposite knee. Gently pull the bottom leg toward your chest. Breathe slowly and let the outer hip release.',
        },
        {
          name: 'Double Knee-to-Chest',
          meta: '60s hold',
          duration: 60,
          sides: false,
          cue: 'Lie on your back and pull both knees gently to your chest. Let the lower back fully decompress. Breathe slowly — no forcing.',
        },
      ],
    },
    {
      phase: 'Activate',
      phaseKey: 'activate',
      exercises: [
        {
          name: 'Dead Bug',
          meta: '3 × 8 each side',
          duration: null,
          cue: 'Lower back pressed firmly into the floor throughout. Extend opposite arm and leg slowly and controlled. If your back lifts, you\'ve gone too far — shorten the range.',
        },
        {
          name: 'Glute Bridge',
          meta: '3 × 15 · 2s hold at top',
          duration: null,
          cue: 'Drive through your heels, squeeze the glutes hard at the top. Don\'t hyperextend — stop when the hips are level. Hold 2 seconds each rep.',
        },
        {
          name: 'Clamshells',
          meta: '2 × 15 each side',
          duration: null,
          cue: 'Feet stacked, hips slightly forward. Rotate the top knee up without letting the pelvis roll back. Slow and deliberate — feel the outer hip working.',
        },
        {
          name: 'Bird Dog',
          meta: '3 × 8 each side',
          duration: null,
          cue: 'On hands and knees. Extend one arm and the opposite leg simultaneously, keeping your hips level. Pause 1–2s at full extension, then return with control.',
        },
      ],
    },
    {
      phase: 'Integrate',
      phaseKey: 'integrate',
      exercises: [
        {
          name: 'Deep Squat Hold',
          meta: '2 × 60s',
          duration: 60,
          sides: false,
          cue: 'Feet shoulder-width, toes slightly out. Sink as deep as you can with heels on the floor. Hold a door frame if needed. Let the hips open and the lower back decompress.',
        },
        {
          name: 'World\'s Greatest Stretch',
          meta: '5 reps each side',
          duration: null,
          cue: 'Step into a deep lunge. Place same-side hand on the floor, rotate the top arm toward the ceiling. Hold 2s at the top. This hits hip flexors, thoracic spine, and hamstrings in one movement.',
        },
        {
          name: 'Cat-Cow into Child\'s Pose',
          meta: '5 slow rounds',
          duration: null,
          cue: 'On hands and knees: arch up (cat), then sink through (cow). After each cow, flow back into child\'s pose for 3–4 breaths. Move slowly — this finishes the session.',
        },
      ],
    },
  ],

  evening: [
    {
      phase: 'Decompress',
      phaseKey: 'decompress',
      exercises: [
        {
          name: 'Child\'s Pose',
          meta: '2 min hold',
          duration: 120,
          sides: false,
          cue: 'Kneel, sit back toward heels, reach arms forward. Let the lower back and hips fully release. Breathe deeply into the back of your ribcage. This is the start of your wind-down.',
        },
        {
          name: 'Supine Spinal Twist',
          meta: '90s each side',
          duration: 90,
          sides: true,
          cue: 'Lie on your back, draw one knee across the body and let it fall to the floor. Extend the same arm out and look away from the knee. Don\'t force the shoulder down — let gravity do it.',
        },
        {
          name: 'Legs Up the Wall',
          meta: '3 min hold',
          duration: 180,
          sides: false,
          cue: 'Sit sideways against a wall, swing both legs up. Hips as close to the wall as comfortable. This passively drains the legs and calms the nervous system — ideal after a training day.',
        },
      ],
    },
    {
      phase: 'Mobilize',
      phaseKey: 'mobilize',
      exercises: [
        {
          name: 'Thoracic Rotation',
          meta: '10 reps each side',
          duration: null,
          cue: 'Lie on your side, knees stacked at 90°. Top hand behind your head. Rotate your top elbow toward the floor behind you, following with your eyes. Return slowly. This is your thoracic spine — don\'t rush it.',
        },
        {
          name: 'Pigeon Pose',
          meta: '90s each side',
          duration: 90,
          sides: true,
          cue: 'From all fours, bring one shin forward at an angle. Lower the back leg straight. Fold forward over the front shin if comfortable. One of the best hip openers — breathe into the tightness.',
        },
        {
          name: 'Lying Hamstring Stretch',
          meta: '60s each side',
          duration: 60,
          sides: true,
          cue: 'On your back, loop a strap or towel around one foot. Gently straighten the leg toward the ceiling. Keep the opposite leg flat and the lower back on the floor. No bouncing.',
        },
        {
          name: 'Ankle Circles + Calf Stretch',
          meta: '60s each side',
          duration: 60,
          sides: true,
          cue: '10 slow ankle circles each direction, then step into a standing calf stretch against the wall or a step. Hold 30s. Often overlooked — tight calves restrict knee tracking and squat depth.',
        },
      ],
    },
    {
      phase: 'Restore',
      phaseKey: 'restore',
      exercises: [
        {
          name: 'Seated Forward Fold',
          meta: '2 min hold',
          duration: 120,
          sides: false,
          cue: 'Sit with legs extended. Hinge from the hips — don\'t round the upper back. Hold shins, feet, or a strap. Each exhale, let the fold deepen slightly. Passive and slow.',
        },
        {
          name: 'Supine Figure-Four',
          meta: '90s each side',
          duration: 90,
          sides: true,
          cue: 'On your back, ankle crossed over the opposite knee. Gently pull the bottom leg toward your chest. Let the outer hip completely release — longer hold than the morning version.',
        },
        {
          name: 'Diaphragmatic Breathing',
          meta: '10 slow breaths',
          duration: null,
          cue: 'Lie flat, one hand on chest, one on belly. Breathe in for 4 counts — only the belly hand should rise. Hold 2s. Exhale for 6 counts. This activates the parasympathetic nervous system and signals recovery.',
        },
      ],
    },
  ],
}
