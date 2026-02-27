<?php
/** Template Name: Hyrox */
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Thrive Athletic Club // Hybrid Workout Library</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /><meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' />
    <style>img:is([sizes="auto" i], [sizes^="auto," i]) { contain-intrinsic-size: 3000px 1500px }</style>
    <meta name="description" content="A library of workouts for hybrid athletes" class="yoast-seo-meta-tag" />
    <meta property="og:locale" content="en_US" class="yoast-seo-meta-tag" />
    <meta property="og:type" content="website" class="yoast-seo-meta-tag" />
    <meta property="og:site_name" content="Thrive Athletic Club" class="yoast-seo-meta-tag" />
    <meta property="og:image" content="https://thriveathletic.club/wp-content/uploads/2024/11/thrive_fb_background.jpg" class="yoast-seo-meta-tag" />
    <meta property="og:image:width" content="2400" class="yoast-seo-meta-tag" />
    <meta property="og:image:height" content="1260" class="yoast-seo-meta-tag" />
    <meta property="og:image:type" content="image/jpeg" class="yoast-seo-meta-tag" />
    <meta name="twitter:card" content="summary_large_image" class="yoast-seo-meta-tag" />
    <link rel="icon" href="https://thriveathletic.club/wp-content/uploads/2024/11/cropped-thrive_icon-32x32.png" sizes="32x32" />
    <link rel="icon" href="https://thriveathletic.club/wp-content/uploads/2024/11/cropped-thrive_icon-192x192.png" sizes="192x192" />
    <link rel="apple-touch-icon" href="https://thriveathletic.club/wp-content/uploads/2024/11/cropped-thrive_icon-180x180.png" />
    <meta name="msapplication-TileImage" content="https://thriveathletic.club/wp-content/uploads/2024/11/cropped-thrive_icon-270x270.png" />
    <!-- / Yoast SEO plugin. -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: system-ui, sans-serif;
            font-family: "DM Mono", monospace;
            font-weight: 400;
            font-style: normal;
            font-size:12px;
            margin: 0;
            padding: 1rem;
            background-color: black;
            color:white;
        }

        h1 {
            text-align: center;
            margin-bottom: 2rem;
        }

        h3 {
            opacity:.5;
            text-transform: uppercase;
            font-size:.8;
            letter-spacing:.1em;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1rem;
        }

        @media screen and (max-width: 768px) {
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
        }


        .card {
            background-color: #252525;
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
            display: flex;
            flex-direction: column;
            gap:1em;
            border: 1px solid black;
        }

        .card > *
        {
            margin:0;
        }

        @media screen and (min-width: 768px) {
            .card:hover {
                border: 1px solid white;
                background: black;
            }

            .grid:hover .card {
                opacity: .5;
            }

            .grid:hover .card:hover {
                opacity: 1;
            }
        }

        .workout-header {
            margin-bottom: 1rem;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 0.5rem;
        }

        .workout-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
        }

        .workout-number {
            font-size: 0.9rem;
            color: #777;
        }

        .section {
            display: flex;
            flex-direction: column;
            gap:1em;
        }

        .section > * {
            margin:0;
        }

        .section-type {
            font-size: 0.9rem;
            font-weight: bold;
            color: #2a73cc;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }

        h4 {
            color:var(--sectioncolor);
        }

        ul {
            border-left:2px solid var(--sectioncolor);
            padding-left: 1em;
            list-style:none;
        }

        ul:last-of-type:not(:first-of-type) {
            opacity: .5;
        }

        li {
            margin-bottom:.3em;
        }

        .section p {
            text-transform: uppercase;
            opacity: .5;
            letter-spacing: .1em;
        }

        .section:nth-of-type(5n-4) {
            --sectioncolor:#FF00FF;
        }
        .section:nth-of-type(5n-3) {
            --sectioncolor:#00FFFF;
        }
        .section:nth-of-type(5n-2) {
            --sectioncolor:#39FF14;
        }
        .section:nth-of-type(5n-1) {
            --sectioncolor:#FFFF00;
        }
        .section:nth-of-type(5n) {
            --sectioncolor:#FF4500;
        }

        .card button:hover {
            background-color: #FF00FF;
        }

        .card button {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: black;
            color: white;
            border: none;
            cursor: pointer;
            border: 1px solid white;
            font-family: inherit;
            text-transform: uppercase;
            letter-spacing: .1em;
        }
    </style>
</head>
<body>
<div>
    <div style="text-align: center; margin-bottom: 2rem;">
        <label for="workoutFilter" style="margin-right: 0.5rem;">Filter by Workout:</label>
        <select id="workoutFilter">
            <option value="all">All Workouts</option>
        </select>
    </div>
    <div id="workouts" class="grid"></div>
</div>

<!-- Embedded JSON data -->
<script type="application/json" id="json-data">
    [
        {
            "workout_number": 1,
            "name": "Thanos",
            "title": "Barbell Lunges + Good Morning | Sled Pull + Burpee Broad Jump | Easy Run",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "PVC Pipe Shoulder Pass-Throughs x 10",
                        "Scapular Push-Ups x 10",
                        "Y-T-W Raises x 10",
                        "Arm Circles x 10",
                        "World’s Greatest Stretch x 10 each side"
                    ]

                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Barbell Lunges + Good Morning (4 Sets)",
                    "description": [
                        "Barbell Lunges x 16",
                        "Barbell Good Morning x 8",
                        "Rest 90s between sets",
                        "Use challenging weight performed unbroken with good form"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Sled Pull + Burpee Broad Jump (5 Rounds)",
                    "description": [
                        "Sled Pull x 20m @ 75/50kg",
                        "Burpee Broad Jump x 20m"
                    ],
                    "alternatives": [
                        "Sandbag Clean x 10 @ 40/30kg",
                        "DB RDL + DB Bent Over Row x 10 @ 2 \u00d7 15/10kg"
                    ]
                },
                "D": {
                    "type": "AEROBIC",
                    "title": "Easy Run",
                    "description": [
                        "Run x 10min+ @ 3\u20134 RPE \u2013 Zone 2",
                        "Pick a time/distance that fits your session (10min+)"
                    ]
                }
            }
        },
        {
            "workout_number": 2,
            "name": "Hulk",
            "title": "Strict Press + Push Press | Compromised Run",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "PVC Pipe Shoulder Pass-Throughs x 10",
                        "Scapular Push-Ups x 10",
                        "Y-T-W Raises x 10",
                        "Arm Circles x 10",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Strict Press + Push Press (4 Sets)",
                    "description": [
                        "Strict Press x 5",
                        "Push Press x 10",
                        "Rest 90s between sets",
                        "Pick a challenging unbroken weight with good form"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Compromised Run",
                    "description": [
                        "Run 800m",
                        "DB Hang Power Clean x 15 @ 2\u00d715/10kg",
                        "Run 800m",
                        "DB Devil Press x 15 @ 2\u00d715/10kg",
                        "Run 800m",
                        "DB Thrusters x 15 @ 2\u00d715/10kg",
                        "Run 800m"
                    ],
                    "alternatives": [
                        "Run > High Knees x 3min or Bike Erg x 2km",
                        "Scale DB load to ensure good form"
                    ]
                }
            }
        },
        {
            "workout_number": 3,
            "name": "Spider-Man",
            "title": "Chin-Ups + Push-Ups | Tempo Run",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Jog or Row x 3–5 min",
                        "Scapular Pull-Ups x 10",
                        "Scapular Push-Ups x 10",
                        "Cat-Cow Stretch x 5",
                        "Inch Worm to Push-Up x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]

                },
                "B": {
                    "type": "EMOM",
                    "title": "EMOM 8 \u2013 Chin Ups + Push Ups",
                    "description": [
                        "Min 1: Chin Ups x 8\u201312 (band if needed)",
                        "Min 2: Push Ups x 10+ (incline if needed)"
                    ]
                },
                "C": {
                    "type": "RUN",
                    "title": "Tempo Run",
                    "description": [
                        "Warm Up: Jog x 5min @ 3\u20134 RPE \u2013 Zone 2",
                        "2 Rounds: Run x 10min @ 7\u20138 RPE \u2013 Zone 4",
                        "Walk x 2min",
                        "Cooldown: Jog x 5min @ 3\u20134 RPE \u2013 Zone 2"
                    ]
                }
            }
        },
        {
            "workout_number": 4,
            "name": "Thor",
            "title": "Deadlift | Row + Sled Push | Speed Intervals",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Arm Circles x 10 each way",
                        "Torso Twists x 10",
                        "Deadlift with Empty Bar x 10",
                        "Lat Stretch Against Wall x 5 breaths",
                        "Cat-Cow Stretch x 5"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Deadlift (E2MOM x 5)",
                    "description": [
                        "Every 2 minutes on the minute:",
                        "Deadlift x 5 reps",
                        "Build to a heavy set of 5 over the 5 sets"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Row + Sled Push",
                    "description": [
                        "Row Erg x 400m, Sled Push x 10m @ 125/75kg",
                        "Row Erg x 600m, Sled Push x 20m @ 125/75kg",
                        "Row Erg x 800m, Sled Push x 30m @ 125/75kg",
                        "Row Erg x 600m, Sled Push x 20m @ 125/75kg",
                        "Row Erg x 400m, Sled Push x 10m @ 125/75kg"
                    ],
                    "alternatives": [
                        "DB Front Rack Step Up @ 2 \u00d7 15/10kg (20\u201d box)",
                        "DB Front Rack Walking Lunges @ 2 \u00d7 15/10kg (Every 10m = 6 reps)"
                    ]
                },
                "D": {
                    "type": "RUN",
                    "title": "Speed Intervals",
                    "description": [
                        "Warm-Up: Jog x 5min @ 3\u20134 RPE \u2013 Zone 2",
                        "5 Rounds: Run x 200m @ 9\u201310 RPE, Rest/Walk x 60s",
                        "Cooldown: Jog x 5min @ 3\u20134 RPE \u2013 Zone 2"
                    ]
                }
            }
        },
        {
            "workout_number": 5,
            "name": "Superman",
            "title": "Back Squat | Burpee Broad Jump | Mixed Endurance | Easy Run",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Squats x 10",
                        "Lateral Lunges x 10 each side",
                        "Inch Worm to Stretch x 5",
                        "Cat-Cow Stretch x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Back Squat (E2MOM x 5)",
                    "description": [
                        "Every 2 minutes on the minute:",
                        "Back Squat x 5 reps",
                        "Build to a heavy set of 5 over 5 sets"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "80m Burpee Broad Jump",
                    "description": [
                        "80m Burpee Broad Jump (ideally 2 \u00d7 40m lengths)",
                        "Score = Workout Time"
                    ]
                },
                "D": {
                    "type": "FOR TIME",
                    "title": "Mixed Endurance (3 Rounds)",
                    "description": [
                        "Row Erg Cal x 20/15",
                        "Ski Erg Cal x 20/15",
                        "Sandbag Walking Lunges x 40m @ 20/10kg"
                    ],
                    "alternatives": [
                        "Front Rack DB Walking Lunges @ 2 \u00d7 10/5kg",
                        "Barbell Walking Lunges @ 20/10kg"
                    ]
                },
                "E": {
                    "type": "RUN",
                    "title": "Easy Run",
                    "description": [
                        "Run x 10min+ @ 3\u20134 RPE \u2013 Zone 2",
                        "Choose time/distance to fit your session",
                        "Record distance, pace, heart rate"
                    ]
                }
            }
        },
        {
            "workout_number": 6,
            "name": "Batman",
            "title": "Bench Press + SA DB Row | Run + Carry",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Jog or Bike x 3–5 min",
                        "PVC Pipe Shoulder Pass-Throughs x 10",
                        "Scapular Push-Ups x 10",
                        "Single-Arm Band Rows x 10 each side",
                        "Arm Circles x 10 each way",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Bench Press + SA DB Bent Over Row (4 Sets)",
                    "description": [
                        "Barbell Bench Press x 12 / rest 60s",
                        "Single Arm DB Bent Over Row x 12 each side / rest 60s",
                        "Use unbroken challenging weights with good form"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Run + Carry (5 Rounds)",
                    "description": [
                        "Farmers Carry x 50m @ 2 \u00d7 24/16kg",
                        "Run 800m"
                    ],
                    "alternatives": [
                        "Run > High Knees x 3min or Bike Erg x 2km"
                    ]
                }
            }
        },
        {
            "workout_number": 7,
            "name": "Wolverine",
            "title": "Pull-Ups + DB Z-Press | Speed Endurance Intervals",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Row Erg or Bike x 3–5 min",
                        "Scapular Pull-Ups x 10",
                        "Scapular Push-Ups x 10",
                        "Cat-Cow Stretch x 5",
                        "Arm Circles x 10 each way",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Pull-Up + DB Z-Press (4 Sets)",
                    "description": [
                        "Pull-Up x 8\u201312 (banded if needed), Rest 60s",
                        "DB Z-Press x 8\u201312, Rest 90s"
                    ]
                },
                "C": {
                    "type": "RUN",
                    "title": "Speed Endurance Intervals",
                    "description": [
                        "Warm-Up: Jog 1km @ 3\u20134 RPE (Zone 2), rest 1 min",
                        "4 Rounds: Run 1000m @ 8\u20139 RPE (Zone 4/5), Rest 90s",
                        "Cooldown: Jog 1km @ 3\u20134 RPE (Zone 2)"
                    ]
                }
            }
        },
        {
            "workout_number": 8,
            "name": "Wonder Woman",
            "title": "Step-Up + B-Stance RDL | Sled Push + Pull + Burpees | Fartlek",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Lunges x 10 each leg",
                        "Torso Twists x 10",
                        "Lateral Lunges x 10 each side",
                        "Cat-Cow Stretch x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Step-Up + B-Stance RDL (4 Sets)",
                    "description": [
                        "DB Step-Up x 8 each leg",
                        "Rest 60s",
                        "B-Stance Romanian Deadlift x 8 each leg",
                        "Rest 60s"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Sled Push + Pull + Burpees (6 Rounds)",
                    "description": [
                        "Sled Push x 10m @ 100/60kg",
                        "Sled Pull x 10m @ 100/60kg",
                        "Burpee x 10"
                    ],
                    "alternatives": [
                        "DB Front Rack Step-Up x 6 @ 2\u00d715/10kg (20\u201d)",
                        "DB Front Rack Walking Lunges x 6 @ 2\u00d715/10kg",
                        "Sandbag Clean x 5 @ 40/30kg",
                        "DB RDL + DB Bent Over Row x 5 @ 2\u00d715/10kg"
                    ]
                },
                "D": {
                    "type": "RUN",
                    "title": "Fartlek Intervals",
                    "description": [
                        "Warm-Up: Jog 5min @ 3\u20134 RPE",
                        "5 Rounds: Run 30s @ 7\u20138 RPE (faster than 5k pace), Jog 90s @ 3\u20134 RPE",
                        "Cooldown: Jog 5min @ 3\u20134 RPE"
                    ]
                }
            }
        },
        {
            "workout_number": 9,
            "name": "Deadpool",
            "title": "Deadlift + Seated Pistol Squats | Mixed Endurance | Easy Run",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Deadlifts x 10 (hinge pattern)",
                        "Torso Twists x 10",
                        "Cat-Cow Stretch x 5",
                        "Lateral Step-Ups x 8 each leg",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Deadlift + Seated Pistol Squats (Every 3 min x 4 rounds)",
                    "description": [
                        "Deadlift x 10 reps @ 7/10 RPE",
                        "Seated Pistol Squats x 10 each leg (to a box)"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Mixed Endurance (5 Rounds)",
                    "description": [
                        "Bike Erg x 1000m",
                        "Sled Push x 30m @ 125/75kg",
                        "Farmer Carry x 100m @ 2\u00d724/16kg"
                    ],
                    "alternatives": [
                        "DB Front Rack Step-Up x 18 @ 2\u00d715/10kg",
                        "DB Walking Lunges x 18 @ 2\u00d715/10kg"
                    ]
                },
                "D": {
                    "type": "RUN",
                    "title": "Easy Run \u2013 Aerobic Recovery",
                    "description": [
                        "Run x 10+ minutes @ 3\u20134 RPE (Zone 2)",
                        "Can be done as a second session"
                    ]
                }
            }
        },
        {
            "workout_number": 9.5,
            "name": "Dogpool",
            "title": "Machine Intervals + Sled Push + Farmer Carry",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Deadlifts x 10 (hinge pattern)",
                        "Torso Twists x 10",
                        "Cat-Cow Stretch x 5",
                        "Lateral Step-Ups x 8 each leg",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "FOR TIME",
                    "title": "Machine Intervals (6 rounds)",
                    "description": [
                        "Each round:",
                        "• Machine Effort (cycle)",
                        "• Sled Push x 30m @ 125/75kg",
                        "• Farmer Carry x 100m @ 2×24/16kg",
                        "",
                        "Rounds 1–6:",
                        "1. Ski Erg x 500m",
                        "2. Row Erg x 500m",
                        "3. Bike Erg x 1000m",
                        "4. Ski Erg x 500m",
                        "5. Row Erg x 500m",
                        "6. Bike Erg x 1000m"
                    ]
                }
            }
        },
        {
            "workout_number": 10,
            "name": "Black Widow",
            "title": "Push + Pull Tabata | Run + Burpees",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Inverted Rows x 10",
                        "Incline Push-Ups x 10",
                        "PVC Pipe Shoulder Pass-Throughs x 10",
                        "Cat-Cow Stretch x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "TABATA",
                    "title": "Push-Ups + Ring Rows",
                    "description": [
                        "8 Rounds:",
                        "Push-Ups x 20s / Rest 10s",
                        "Ring Rows x 20s / Rest 10s"
                    ],
                    "alternatives": [
                        "Incline Push-Ups",
                        "Inverted Rows"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Run + Burpees",
                    "description": [
                        "Run 200m + Burpees x 5",
                        "Run 400m + Burpees x 10",
                        "Run 600m + Burpees x 15",
                        "Run 800m + Burpees x 20",
                        "Run 1000m + Burpees x 25"
                    ],
                    "alternatives": [
                        "Run \u2192 Bike 2.5x distance",
                        "Burpees \u2192 2x Air Squats"
                    ]
                }
            }
        },
        {
            "workout_number": 11,
            "name": "Iron Man",
            "title": "Barbell Strict Press + Pull-Ups | Tempo Run",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Row Erg or Bike x 3–5 min",
                        "Scapular Pull-Ups x 10",
                        "Band Pull-Aparts x 15",
                        "Scapular Push-Ups x 10",
                        "Torso Twists x 10",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Barbell Strict Press + Pull-Ups (4 Sets)",
                    "description": [
                        "Strict Press x 6\u20138 (add weight if 8 reps is easy)",
                        "Rest 60s",
                        "Pull-Up x 6\u20138 (banded if needed)",
                        "Rest 90s"
                    ]
                },
                "C": {
                    "type": "RUN",
                    "title": "Tempo Run \u2013 Zone Work",
                    "description": [
                        "Jog 10 min @ 3\u20134 RPE (Zone 2)",
                        "Run 20 min @ 7\u20138 RPE (Zone 4)",
                        "Jog 10 min @ 3\u20134 RPE (Zone 2)"
                    ],
                    "notes": [
                        "Track pace and HR if possible"
                    ]
                }
            }
        },
        {
            "workout_number": 12,
            "name": "Groot",
            "title": "Walking Lunges | AMRAP Mixed Endurance | Hill Sprints",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Lunges x 10 each leg",
                        "Air Squats x 10",
                        "Lateral Lunges x 10 each side",
                        "Cat-Cow Stretch x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Barbell Walking Lunges (4 Sets)",
                    "description": [
                        "20 reps @ 7/10 RPE",
                        "Rest 90s"
                    ]
                },
                "C": {
                    "type": "AMRAP15",
                    "title": "Mixed Endurance Circuit",
                    "description": [
                        "Assault Bike x 15/10 cal",
                        "Sled Pull x 30m @ 75/50kg",
                        "Farmer Carry x 100m @ 2\u00d724/16kg"
                    ],
                    "alternatives": [
                        "Sled Pull \u2192 Sandbag Clean x 15 @ 40/30kg",
                        "DB RDL + DB Bent Over Row x 15 @ 2\u00d715/10kg"
                    ]
                },
                "D": {
                    "type": "RUN",
                    "title": "Hill Sprints (5 Rounds)",
                    "description": [
                        "Warm-up Jog 5 min @ 3\u20134 RPE",
                        "Hill Sprint x 20s @ 9\u201310 RPE (5\u20138% incline)",
                        "Walk/Rest 60s",
                        "Cooldown Jog 5 min"
                    ]
                }
            }
        },
        {
            "workout_number": 13,
            "name": "Gamora",
            "title": "DB Lunges + RDL | Ski Erg + Sled Pull | Easy Run",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Lunges x 10 each leg",
                        "Torso Twists x 10",
                        "Good Morning Stretch (empty bar or broomstick) x 10",
                        "Lateral Lunges x 10 each side",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Dumbbell Lunges + RDL (4 Sets)",
                    "description": [
                        "DB Walking Lunges x 12",
                        "DB Romanian Deadlifts x 12",
                        "Rest 90s between sets"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Ski Erg + Sled Pull",
                    "description": [
                        "Ski 200m + Sled Pull 10m @ 75/50kg",
                        "Ski 400m + Sled Pull 20m",
                        "Ski 600m + Sled Pull 30m",
                        "Ski 800m + Sled Pull 40m",
                        "Ski 1000m + Sled Pull 50m"
                    ],
                    "alternatives": [
                        "Sled Pull \u2192 Sandbag Clean @ 40/30kg",
                        "or DB RDL + Bent Row @ 2\u00d715/10kg (Half the sled distance = reps)"
                    ]
                },
                "D": {
                    "type": "EASY RUN",
                    "title": "Aerobic Run",
                    "description": [
                        "Run for 10+ minutes @ 3\u20134 RPE (Zone 2)",
                        "Track time, pace, distance, and heart rate"
                    ]
                }
            }
        },
        {
            "workout_number": 14,
            "name": "Rocket",
            "title": "Chin-Ups + Bench Dips | Farmer Carry | Run + Wall Balls",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Row Erg or Bike x 3–5 min",
                        "Scapular Pull-Ups x 10",
                        "Band Chest Fly x 10",
                        "Bodyweight Dips x 10",
                        "Torso Twists x 10",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Chin-Ups + Bench Dips (4 Sets)",
                    "description": [
                        "Chin-Ups x 8\u201312 (band or weighted if needed)",
                        "Bench Dips x 15",
                        "Rest 90s"
                    ],
                    "alternatives": [
                        "Supinated Grip Lat Pulldown x 12"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Farmer Carry",
                    "description": [
                        "200m Kettlebell Farmer Carry @ 2\u00d724/16kg",
                        "(Recommended: 4 \u00d7 50m lengths)"
                    ]
                },
                "D": {
                    "type": "FOR TIME",
                    "title": "Run + Wall Balls (5 Rounds)",
                    "description": [
                        "Run 400m",
                        "Wall Ball x 15 @ 6/4kg"
                    ],
                    "alternatives": [
                        "Run \u2192 High Knees 90s or Bike Erg 1km",
                        "Wall Balls \u2192 DB Thrusters @ 2\u00d78/4kg"
                    ]
                }
            }
        },
        {
            "workout_number": 15,
            "name": "Drax",
            "title": "Renegade Row + Push Press | Running Intervals",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike or Jog x 3–5 minutes",
                        "Inch Worm to Push-Up x 5",
                        "World’s Greatest Stretch x 10 each side",
                        "Bodyweight Air Squats x 10",
                        "Torso Twists x 10",
                        "Dynamic Hamstring Scoops x 10 each leg"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "DB Renegade Row + Push Press (4 Rounds)",
                    "description": [
                        "E2MOM x 4 Rounds:",
                        "DB Renegade Row x 8–12",
                        "DB Push Press x 8–12",
                        "",
                        "Add weight if both movements are completed in <1 minute"
                    ]
                },
                "C": {
                    "type": "SPEED ENDURANCE",
                    "title": "Running Intervals",
                    "description": [
                        "Warm-up: Jog 1km @ 3–4 RPE (Zone 2)",
                        "",
                        "Main Set – 3 Rounds:",
                        "Run 1600m / 1 mile @ 8–9 RPE (Zone 4/5)",
                        "Rest 90s",
                        "",
                        "Cooldown: Jog 1km @ 3–4 RPE",
                        "",
                        "Track pace, consistency, and heart rate"
                    ]
                }
            }
        },
        {
            "workout_number": 16,
            "name": "Black Panther",
            "title": "Deadlifts | Ski Erg + DB Snatches + Box Step-Overs",
            "title": "Front Squat + Sled Push + Running Intervals",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike or Row x 3–5 min",
                        "Leg Swings (forward/back + lateral) x 10 each leg",
                        "Bodyweight Squats x 10",
                        "Walking Lunges x 10 each leg",
                        "Torso Twists x 10",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Front Squat E2MOM",
                    "description": [
                        "Every 2 minutes on the minute for 5 sets:",
                        "Front Squat x 5 reps – build to a heavy set of 5 over the 5 rounds"
                    ]
                },
                "C": {
                    "type": "FOR TIME",
                    "title": "Sled Push + Sandbag Walking Lunges (4 Rounds)",
                    "description": [
                        "Sled Push x 20m @ 125/75kg",
                        "Sandbag Walking Lunges x 20 @ 20/10kg"
                    ],
                    "alternatives": [
                        "Sled Push > DB Front Rack Step Up x 12 @ 2 x 15/10kg (20” box)",
                        "DB Front Rack Walking Lunges x 12 @ 2 x 15/10kg",
                        "Sandbag Walking Lunges > Front Rack DB Walking Lunges @ 2 x 10/5kg",
                        "Barbell Walking Lunges @ 20/10kg"
                    ]
                },
                "D": {
                    "type": "RUN",
                    "title": "Running – Fartlek Intervals",
                    "description": [
                        "Warm-Up: Jog x 5 min @ 3–4 RPE – Zone 2",
                        "4 Rounds:",
                        "Run x 60s @ 7–8 RPE – Faster than 5k pace",
                        "Jog x 90s @ 3–4 RPE",
                        "Cooldown: Jog x 5 min @ 3–4 RPE – Zone 2",
                        "Record paces and HR if possible. Keep rounds consistent."
                    ]
                }
            }
        },
        {
            "workout_number": 17,
            "name": "Hawkeye",
            "title": "Thrusters + Box Jump | EMOM Grinder | Farmer Carry",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Deadlifts with Reach x 10",
                        "Walking Lunges x 10 each leg",
                        "Good Morning Stretch (empty bar or broomstick) x 10",
                        "Cat-Cow Stretch x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "STRENGTH",
                    "title": "Thrusters + Box Jump (4 Sets)",
                    "description": [
                        "Thrusters x 8 @ 2\u00d715/10kg",
                        "Box Jumps x 8 @ 20\"/24\"",
                        "Rest 90s"
                    ]
                },
                "C": {
                    "type": "EMOM10",
                    "title": "Grinder EMOM",
                    "description": [
                        "Min 1: Ski Erg x 15/12 cal",
                        "Min 2: Burpees x 10 + DB RDL x 10 @ 2\u00d715/10kg"
                    ]
                },
                "D": {
                    "type": "FOR TIME",
                    "title": "Farmer Carry",
                    "description": [
                        "200m Farmer Carry @ 2\u00d732/24kg",
                        "For time"
                    ]
                }
            }
        },
        {
            "workout_number": 18,
            "name": "Cyclops",
            "title": "Row Intervals + Bodyweight Strength",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Row Erg or Bike x 3–5 min",
                        "Scapular Pull-Ups x 10",
                        "Scapular Push-Ups x 10",
                        "Arm Circles x 10",
                        "Cat-Cow Stretch x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "INTERVAL",
                    "title": "Row + Strength (5 Rounds)",
                    "description": [
                        "Row 500m",
                        "Push-Ups x 15",
                        "Air Squats x 20",
                        "Sit-Ups x 25"
                    ]
                }
            }
        },
        {
            "workout_number": 19,
            "name": "Jean Grey",
            "title": "Run + Wall Balls | Core Finisher",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Row/Bike/Run x 3–5 min",
                        "Dynamic Hamstring Scoops x 10",
                        "Walking Lunges x 10 each leg",
                        "Torso Twists x 10",
                        "Inch Worm to Push-Up x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "FOR TIME",
                    "title": "Run + Wall Balls",
                    "description": [
                        "5 Rounds:",
                        "Run 400m",
                        "Wall Balls x 20 @ 6/4kg"
                    ]
                },
                "C": {
                    "type": "CORE",
                    "title": "Core Finisher",
                    "description": [
                        "Plank Hold x 1 min",
                        "Russian Twists x 30",
                        "Leg Raises x 20"
                    ]
                }
            }
        },
        {
            "workout_number": 20,
            "name": "Star-Lord",
            "title": "Run Progression (Ladders)",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Squats x 10",
                        "Lateral Lunges x 10 each side",
                        "Arm Circles x 10 each way",
                        "Torso Twists x 10",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "INTERVAL RUN",
                    "title": "Progressive Run",
                    "description": [
                        "Run 200m @ 6 RPE",
                        "Run 400m @ 7 RPE",
                        "Run 600m @ 8 RPE",
                        "Run 800m @ 9 RPE",
                        "Recover Jog x 3 min",
                        "Repeat once"
                    ]
                }
            }
        },
        {
            "workout_number": 21,
            "name": "Ant-Man",
            "title": "Partner AMRAP + Carry",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Jog or Bike x 3–5 min",
                        "High Knees x 20",
                        "Butt Kicks x 20",
                        "Skips x 10m",
                        "Dynamic Hamstring Scoops x 10 each leg",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "PARTNER",
                    "title": "20 Minute AMRAP",
                    "description": [
                        "P1: Ski Erg x 250m",
                        "P2: DB Thrusters x 15",
                        "Switch and repeat for 20 min",
                        "Afterward: KB Farmer Carry 200m each"
                    ]
                }
            }
        },
        {
            "workout_number": 22,
            "name": "Scarlet Witch",
            "title": "Bike Sprints + Core",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row x 3–5 min",
                        "Bodyweight Deadlifts with Reach x 10",
                        "Walking Lunges x 10 each leg",
                        "Good Morning Stretch (empty bar or broomstick) x 10",
                        "Cat-Cow Stretch x 5",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "SPRINTS",
                    "title": "Bike Intervals",
                    "description": [
                        "10 Rounds:",
                        "Bike Sprint x 20s @ max effort",
                        "Rest x 100s"
                    ]
                },
                "C": {
                    "type": "CORE",
                    "title": "Core Stability",
                    "description": [
                        "Hollow Hold x 30s",
                        "Bird Dogs x 10/side",
                        "Side Plank x 30s/side"
                    ]
                }
            }
        },
        {
            "workout_number": 23,
            "name": "Bane",
            "title": "Sled Push + Pull Circuit",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Bike/Row/Run x 3–5 min",
                        "Bodyweight Squats x 10",
                        "Lateral Lunges x 10 each side",
                        "Walking Lunges x 10 each leg",
                        "Torso Twists x 10",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "FOR TIME",
                    "title": "Sled Push + Pull (4 Rounds)",
                    "description": [
                        "Sled Push x 20m @ 125/75kg",
                        "Sled Pull x 20m @ 100/60kg",
                        "Rest 1 min between rounds"
                    ]
                }
            }
        },
        {
            "workout_number": 24,
            "name": "Captain America",
            "title": "Final Benchmark Workout",
            "sections": {
                "A": {
                    "type": "WARM UP",
                    "description": [
                        "Jog x 3–5 min",
                        "High Knees x 20",
                        "Butt Kicks x 20",
                        "Skips x 10m",
                        "Dynamic Hamstring Scoops x 10 each leg",
                        "World’s Greatest Stretch x 10 each side"
                    ]
                },
                "B": {
                    "type": "BENCHMARK",
                    "title": "Mini HYROX Simulation",
                    "description": [
                        "Run 1000m",
                        "Sled Push 50m @ 152/102kg",
                        "Sled Pull 50m @ 103/78kg",
                        "Burpee Broad Jumps 80m",
                        "Row 1000m",
                        "Farmer Carry 200m",
                        "Sandbag Lunges 100m",
                        "Wall Balls x 100"
                    ]
                }
            }
        }
    ]
</script>
<script>
    const data = JSON.parse(document.getElementById("json-data").textContent);
    const container = document.getElementById("workouts");

    data.forEach(workout => {
        const card = document.createElement("div");
        card.className = "card";

// Create the "Workout #" label
        const label = document.createElement("h3");
        label.textContent = `Workout #${workout.workout_number}`;

// Create the larger header for the workout name
        const header = document.createElement("h2");
        header.textContent = workout.name;

// Append both to the card
        card.appendChild(label);
        card.appendChild(header);

        const title = document.createElement("h3");
        title.textContent = workout.title;
        card.appendChild(title);

        const sections = workout.sections;
        for (const key in sections) {
            const section = sections[key];
            const sectionWrapper = document.createElement("div");
            sectionWrapper.className = "section";

            const sectionTitle = document.createElement("h4");
            sectionTitle.textContent = `${key}. ${section.type}${section.title ? " – " + section.title : ""}`;
            sectionWrapper.appendChild(sectionTitle);

            const descList = document.createElement("ul");
            section.description.forEach(line => {
                const li = document.createElement("li");
                li.textContent = line;
                descList.appendChild(li);
            });
            sectionWrapper.appendChild(descList);

            if (section.alternatives) {
                const altHeader = document.createElement("p");
                altHeader.innerHTML = "<strong>Alternatives:</strong>";
                sectionWrapper.appendChild(altHeader);

                const altList = document.createElement("ul");
                section.alternatives.forEach(alt => {
                    const li = document.createElement("li");
                    li.textContent = alt;
                    altList.appendChild(li);
                });
                sectionWrapper.appendChild(altList);
            }

            card.appendChild(sectionWrapper);
        }

        const shareButton = document.createElement("button");
        shareButton.textContent = "Share this workout";

        shareButton.addEventListener("click", () => {
            const url = new URL(window.location);
            url.searchParams.set("workout", workout.workout_number);
            navigator.clipboard.writeText(url.toString()).then(() => {
                shareButton.textContent = "Link copied!";
                setTimeout(() => shareButton.textContent = "Share this workout", 2000);
            });
        });

        card.appendChild(shareButton);

        container.appendChild(card);

        card.dataset.workoutNumber = workout.workout_number;
        card.dataset.workoutName = workout.name;
    });

    // Populate the select dropdown
    const select = document.getElementById("workoutFilter");
    data.forEach(workout => {
        const option = document.createElement("option");
        option.value = workout.workout_number;
        option.textContent = `#${workout.workout_number} – ${workout.name}`;
        select.appendChild(option);
    });

    // Handle filtering logic
    select.addEventListener("change", () => {
        const selected = select.value;
        const cards = document.querySelectorAll(".card");

        cards.forEach(card => {
            if (selected === "all") {
                card.style.display = "";
            } else {
                card.style.display = (card.dataset.workoutNumber === selected) ? "" : "none";
            }
        });
    });

    // On load: check for URL param
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedWorkout = urlParams.get("workout");
    if (preselectedWorkout) {
        select.value = preselectedWorkout;
        const event = new Event("change");
        select.dispatchEvent(event);
    }

</script>
</body>
</html>