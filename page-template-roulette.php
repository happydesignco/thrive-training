<?php
/** Template Name: HYROX Random Movement Generator */
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Thrive Athletic Club // HYROX Roulette</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /><meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' />
    <style>img:is([sizes="auto" i], [sizes^="auto," i]) { contain-intrinsic-size: 3000px 1500px }</style>
    <meta name="description" content="A random HYROX movement generator." class="yoast-seo-meta-tag" />
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
            opacity:1;
            text-transform: uppercase;
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
            border-left:0px solid var(--sectioncolor);
            padding-left: 0;
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

        .section p.smaller {
            opacity:1;
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

        .border-section {
            border:2px solid #FF00FF;
            padding:40px;
            display: flex;
            flex-direction: column;
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

        .card button:hover {
            background-color: #FF00FF;
        }

        #hyrox-controls {
            margin-bottom: 1.5rem;
            gap: 1rem;
        }

        #hyrox-controls label span {
            opacity: .6;
            text-transform: uppercase;
            letter-spacing: .1em;
            font-size: .75rem;
        }
        /* ===========================
           HYROX CONTROLS — 5/3/1 STYLE
           =========================== */

        #hyrox-controls {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        /* Label layout */
        #hyrox-controls label {
            display: flex;
            gap: 1em;
            align-items: center;
        }

        /* Label text */
        #hyrox-controls label span {
            opacity: .6;
            text-transform: uppercase;
            letter-spacing: .1em;
            font-size: .75rem;
        }

        /* Inputs + selects */
        #hyrox-controls input,
        #hyrox-controls select {
            width: 100%;
            padding: 0.6rem;
            border: 1px solid #333;
            border-radius: 6px;
            background: #151515;
            color: white;
            font-family: inherit;
        }

        /* Checkbox wrapper (same as 5/3/1) */
        #hyrox-controls .checkbox_wrapper {
            display: flex;
            align-items: center;
            grid-column: 1 / -1;
        }

        /* Custom checkbox */
        #hyrox-controls input[type="checkbox"] {
            width: 22px;
            height: 22px;
            cursor: pointer;
            border: 2px solid white;
            border-radius: 4px;
            background: transparent;
            appearance: none;
            -webkit-appearance: none;
            position: relative;
            margin-right: 0.75rem;
        }

        /* Checked state */
        #hyrox-controls input[type="checkbox"]:checked {
            background-color: #FF00FF;
            border-color: #FF00FF;
        }

        .animal-style {
            display: block;
            padding: 1em;
            background: #FF00FF;
            color: white;
            font-size: 1.25em;
            width: 50%;
            margin: 1rem auto 0;
        }

        #hyrox-controls input[type="checkbox"]:checked::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 7px;
            width: 5px;
            height: 10px;
            border: solid black;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }

        /* ===========================
           DESKTOP LAYOUT MATCH
           =========================== */
        @media (min-width: 768px) {
            #hyrox-controls {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                align-items: center;
            }

            #hyrox-controls .checkbox_wrapper {
                grid-column: 1 / 3;
            }
        }

        .colored {
            color:#00FFFF;
            opacity:.8;
        }
    </style>
</head>
<body>
<div class="hyrox-randomizer-wrap grid">
    <div class="card section">
        <h1>HYROX Roulette</h1>

        <div class="hyrox-instructions">
            <p>Run as a timed AMRAP, or complete all 8 (randomized) stations. You pick.</p>
            <ul>
                <li><span class="colored"> → Run</span></li>
                <li> → Click "HIT ME"</li>
                <li> → Complete the station</li>
                <li> → <span style="color:#FF00FF;opacity:.8;">REPEAT</span></li>
            </ul>
            <p class="small">If you’ve already done the station, hit the button again. Or not.</p>
            <p class="smaller"><span class="colored">Run 1000m to simulate a full HYROX. Use 500m to increase station density within the same time window.</span></p>

        </div>
        <form id="hyrox-controls">
            <label>
                <span>Division</span>
                <select id="division">
                    <option value="open" selected>Open</option>
                    <option value="pro">Pro</option>
                </select>
            </label>

            <label class="checkbox_wrapper">
                <input id="partner" type="checkbox" checked="checked">
                Partner Format (half volume)
            </label>

            <label class="checkbox_wrapper">
                <input id="animal-style" type="checkbox">
                Animal Style
            </label>
        </form>
        <div class="border-section">

            <h3 id="hyrox-result" class="hyrox-result">
                Ready?
            </h3>

            <ul>
                <li id="hyrox-details" class="hyrox-details"></li>
            </ul>

            <button id="hyrox-button">
                Hit Me
            </button>
        </div>
    </div>
</div>

<script>
    (function () {
        const movements = [
            {
                name: "SkiErg",
                open: {
                    solo: "1000m",
                    partner: "500m"
                },
                pro: {
                    solo: "1000m",
                    partner: "1000m"
                }
            },
            {
                name: "Sled Push",
                open: {
                    solo: "50m — Men: 152kg · Women: 102kg",
                    partner: "25m — Men: 152kg · Women: 102kg"
                },
                pro: {
                    solo: "50m — Men: 202kg · Women: 152kg",
                    partner: "25m — Men: 202kg · Women: 152kg"
                }
            },
            {
                name: "Sled Pull",
                open: {
                    solo: "50m — Men: 103kg · Women: 78kg",
                    partner: "25m — Men: 103kg · Women: 78kg"
                },
                pro: {
                    solo: "50m — Men: 153kg · Women: 103kg",
                    partner: "25m — Men: 153kg · Women: 103kg"
                }
            },
            {
                name: "Burpee Broad Jumps",
                open: {
                    solo: "80m",
                    partner: "40m"
                },
                pro: {
                    solo: "80m",
                    partner: "40m"
                }
            },
            {
                name: "Row",
                open: {
                    solo: "1000m",
                    partner: "500m"
                },
                pro: {
                    solo: "1000m",
                    partner: "500m"
                }
            },
            {
                name: "Farmers Carry",
                open: {
                    solo: "200m — Men: 2×24kg · Women: 2×16kg",
                    partner: "100m — Men: 2×24kg · Women: 2×16kg"
                },
                pro: {
                    solo: "200m — Men: 2×32kg · Women: 2×24kg",
                    partner: "100m — Men: 2×32kg · Women: 2×24kg"
                }
            },
            {
                name: "Sandbag Lunges",
                open: {
                    solo: "100m — Men: 20kg · Women: 10kg",
                    partner: "50m — Men: 20kg · Women: 10kg"
                },
                pro: {
                    solo: "100m — Men: 30kg · Women: 20kg",
                    partner: "50m — Men: 30kg · Women: 20kg"
                }
            },
            {
                name: "Wall Balls",
                open: {
                    solo: "100 reps — Men: 14lb / 10ft · Women: 9lb / 9ft",
                    partner: "50 reps — Men: 14lb / 10ft · Women: 9lb / 9ft"
                },
                pro: {
                    solo: "100 reps — Men: 20lb / 10ft · Women: 14lb / 9ft",
                    partner: "50 reps — Men: 20lb / 10ft · Women: 14lb / 9ft"
                }
            }
        ];

        const button = document.getElementById('hyrox-button');
        const result = document.getElementById('hyrox-result');
        const details = document.getElementById('hyrox-details');

        const divisionSelect = document.getElementById('division');
        const partnerBox = document.getElementById('partner');
        const animalStyleBox = document.getElementById('animal-style');

        button.addEventListener('click', function () {
            const randomIndex = Math.floor(Math.random() * movements.length);
            const movement = movements[randomIndex];

            const division = divisionSelect.value; // open | pro
            const format = partnerBox.checked ? 'partner' : 'solo';

            // Animal Style: 25% chance to add weight vest
            const addWeightVest = animalStyleBox.checked && Math.random() < 0.25;

            result.classList.add('hyrox-hidden');
            details.classList.add('hyrox-hidden');

            setTimeout(() => {
                result.textContent = movement.name;
                let detailsText = movement[division][format];
                if (addWeightVest) {
                    detailsText += '<span class="animal-style">ANIMAL STYLE</span>';
                }
                details.innerHTML = detailsText;

                result.classList.remove('hyrox-hidden');
                details.classList.remove('hyrox-hidden');
            }, 200);
        });

    })();
</script>

<style>
    .hyrox-randomizer-wrap {
        max-width: 760px;
        margin: 0 auto;
        text-align: center;
    }

    .hyrox-instructions {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        text-align:left;
    }

    .hyrox-instructions ul {
        list-style:none;
        max-width: 14em;
        text-align: left;
    }
    .small {
        font-size:.9em;
    }
    .smaller {
        font-size:.8em;
        opacity:1;
    }
    .hyrox-result {
        font-size: 2.6rem;
        font-weight: 700;
        margin:0 auto;
        line-height:1.1;
    }

    .hyrox-details {
        font-size: 1.2rem;
        opacity: 0.85;
        margin-top: 0.6rem;
        min-height: 1.6rem;
    }

    .hyrox-button {
        font-size: 1.25rem;
        padding: 1rem 2.5rem;
        margin-top: 4rem;
        cursor: pointer;
    }

    .hyrox-result,
    .hyrox-details {
        transition:
                opacity 250ms ease,
                transform 250ms ease;
    }

    .hyrox-hidden {
        opacity: 0;
        transform: translateY(8px);
    }
</style>
</body>
</html>