<?php
/** Template Name: 5-3-1 Calculator */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Thrive Athletic Club // 5-3-1 Calculator</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="A personalized 5/3/1 training calculator for hybrid athletes at Thrive Athletic Club" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="icon" href="https://thriveathletic.club/wp-content/uploads/2024/11/cropped-thrive_icon-32x32.png" sizes="32x32" />
    <link rel="icon" href="https://thriveathletic.club/wp-content/uploads/2024/11/cropped-thrive_icon-192x192.png" sizes="192x192" />
    <link rel="apple-touch-icon" href="https://thriveathletic.club/wp-content/uploads/2024/11/cropped-thrive_icon-180x180.png" />
    <meta name="msapplication-TileImage" content="https://thriveathletic.club/wp-content/uploads/2024/11/cropped-thrive_icon-270x270.png" />
    <style>
        :root {
            --color1: #FF00FF;  /* magenta */
            --color2: #00FFFF;  /* cyan */
            --color3: #39FF14;  /* neon green */
            --color4: #FFFF00;  /* yellow */
            --color5: #FF4500;  /* orange */
        }
        * { box-sizing:border-box; }
        /* Base body */
        body {
            background: black;
            color: white;
            font-family: "DM Mono", monospace;
            margin: 0;
            padding: 1rem;
        }

        /* ===========================
           SECTION COLOR ROTATION
           =========================== */
        .section:nth-of-type(5n-4) { --sectioncolor: var(--color1); }
        .section:nth-of-type(5n-3) { --sectioncolor: var(--color2); }
        .section:nth-of-type(5n-2) { --sectioncolor: var(--color3); }
        .section:nth-of-type(5n-1) { --sectioncolor: var(--color4); }
        .section:nth-of-type(5n)   { --sectioncolor: var(--color5); }

        /* Section color classes for lifts */
        .color1 th {
            color: var(--color1);
        }
        .color1 tr:nth-of-type(3n) {
            color: color-mix(in srgb, var(--color1) 40%, white);
        }
        .color2 th {
            color: var(--color2);
        }
        .color2 tr:nth-of-type(3n) {
            color: color-mix(in srgb, var(--color2) 40%, white);
        }
        .color3 th {
            color: var(--color3);
        }
        .color3 tr:nth-of-type(3n) {
            color: color-mix(in srgb, var(--color3) 40%, white);
        }
        .color4 th {
            color: var(--color4);
        }
        .color4 tr:nth-of-type(3n) {
            color: color-mix(in srgb, var(--color4) 40%, white);
        }
        .color5 th {
            color: var(--color5);
        }
        .color5 tr:nth-of-type(3n) {
            color: color-mix(in srgb, var(--color5) 40%, white);
        }
        /* ==================================================
           PER-LIFT BASE COLORS (fallbacks)
           ================================================== */
        .lift-squat td, .lift-squat th { color: var(--color1); }
        .lift-bench td, .lift-bench th { color: var(--color2); }
        .lift-deadlift td, .lift-deadlift th { color: var(--color3); }
        .lift-press td, .lift-press th { color: var(--color4); }

        /* Lift labels (first column always full color) */
        .lift-squat td:first-child { color: var(--color1) !important; }
        .lift-bench td:first-child { color: var(--color2) !important; }
        .lift-deadlift td:first-child { color: var(--color3) !important; }
        .lift-press td:first-child { color: var(--color4) !important; }

        /* ==================================================
           NO BBB — 3 ROWS PER LIFT
           ================================================== */
        table:not(.has-bbb) .lift-squat:nth-of-type(3n-2) td {
            color: color-mix(in srgb, var(--color1) 20%, white);
        }
        table:not(.has-bbb) .lift-squat:nth-of-type(3n-1) td {
            color: color-mix(in srgb, var(--color1) 40%, white);
        }
        table:not(.has-bbb) .lift-squat:nth-of-type(3n) td {
            color: color-mix(in srgb, var(--color1) 60%, white);
        }

        table:not(.has-bbb) .lift-bench:nth-of-type(3n-2) td {
            color: color-mix(in srgb, var(--color2) 20%, white);
        }
        table:not(.has-bbb) .lift-bench:nth-of-type(3n-1) td {
            color: color-mix(in srgb, var(--color2) 40%, white);
        }
        table:not(.has-bbb) .lift-bench:nth-of-type(3n) td {
            color: color-mix(in srgb, var(--color2) 60%, white);
        }

        table:not(.has-bbb) .lift-deadlift:nth-of-type(3n-2) td {
            color: color-mix(in srgb, var(--color3) 20%, white);
        }
        table:not(.has-bbb) .lift-deadlift:nth-of-type(3n-1) td {
            color: color-mix(in srgb, var(--color3) 40%, white);
        }
        table:not(.has-bbb) .lift-deadlift:nth-of-type(3n) td {
            color: color-mix(in srgb, var(--color3) 60%, white);
        }

        table:not(.has-bbb) .lift-press:nth-of-type(3n-2) td {
            color: color-mix(in srgb, var(--color4) 20%, white);
        }
        table:not(.has-bbb) .lift-press:nth-of-type(3n-1) td {
            color: color-mix(in srgb, var(--color4) 40%, white);
        }
        table:not(.has-bbb) .lift-press:nth-of-type(3n) td {
            color: color-mix(in srgb, var(--color4) 60%, white);
        }

        /* ==================================================
           BBB ACTIVE — 4 ROWS PER LIFT
           (last row is .bbb-row and excluded)
           ================================================== */
        table.has-bbb .lift-squat:nth-of-type(4n-3):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color1) 20%, white);
        }
        table.has-bbb .lift-squat:nth-of-type(4n-2):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color1) 40%, white);
        }
        table.has-bbb .lift-squat:nth-of-type(4n-1):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color1) 60%, white);
        }

        table.has-bbb .lift-bench:nth-of-type(4n-3):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color2) 20%, white);
        }
        table.has-bbb .lift-bench:nth-of-type(4n-2):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color2) 40%, white);
        }
        table.has-bbb .lift-bench:nth-of-type(4n-1):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color2) 60%, white);
        }

        table.has-bbb .lift-deadlift:nth-of-type(4n-3):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color3) 20%, white);
        }
        table.has-bbb .lift-deadlift:nth-of-type(4n-2):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color3) 40%, white);
        }
        table.has-bbb .lift-deadlift:nth-of-type(4n-1):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color3) 60%, white);
        }

        table.has-bbb .lift-press:nth-of-type(4n-3):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color4) 20%, white);
        }
        table.has-bbb .lift-press:nth-of-type(4n-2):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color4) 40%, white);
        }
        table.has-bbb .lift-press:nth-of-type(4n-1):not(.bbb-row) td {
            color: color-mix(in srgb, var(--color4) 60%, white);
        }

        /* ==================================================
           BBB ROW OVERRIDE
           ================================================== */
        .bbb-row td {
            color: white !important;
        }
        /* No BBB (3 rows per lift) */
        table:not(.has-bbb) .lift-squat:nth-of-type(3n) {
            border-bottom: 2px solid color-mix(in srgb, var(--color1) 20%, black);
        }
        table:not(.has-bbb) .lift-bench:nth-of-type(3n) {
            border-bottom: 2px solid color-mix(in srgb, var(--color2) 20%, black);
        }
        table:not(.has-bbb) .lift-deadlift:nth-of-type(3n) {
            border-bottom: 2px solid color-mix(in srgb, var(--color3) 20%, black);
        }
        table:not(.has-bbb) .lift-press:nth-of-type(3n) {
            border-bottom: 2px solid color-mix(in srgb, var(--color4) 20%, black);
        }

        /* BBB active (4 rows per lift) */
        table.has-bbb .lift-squat:nth-of-type(4n) {
            border-bottom: 2px solid color-mix(in srgb, var(--color1) 20%, black);
        }
        table.has-bbb .lift-bench:nth-of-type(4n) {
            border-bottom: 2px solid color-mix(in srgb, var(--color2) 20%, black);
        }
        table.has-bbb .lift-deadlift:nth-of-type(4n) {
            border-bottom: 2px solid color-mix(in srgb, var(--color3) 20%, black);
        }
        table.has-bbb .lift-press:nth-of-type(4n) {
            border-bottom: 2px solid color-mix(in srgb, var(--color4) 20%, black);
        }
        /* BBB row styling */
        .bbb-row td {
            color: white !important;
        }

        .container {
            max-width:600px;
            margin:0 auto;
        }

        .container small {
            margin-top:1em;
            opacity:.5;
            display:block;
        }
        /* ===========================
           MOBILE-FIRST FORMS
           =========================== */
        form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        label {
            display: grid;
            grid-template-columns: 2fr 3fr;
            gap: 0.25rem;
            align-items: center;
        }

        label.checkbox_wrapper {
            display:flex;
            grid-column: 1 / -1;
        }

        input, select {
            width: 100%;
            padding: 0.6rem;
            border: 1px solid #333;
            border-radius: 6px;
            background: #151515;
            color: white;
            font-family: inherit;
        }

        /* Style for the rounding checkbox */
        #round, #bbb {
            width: 22px;
            height: 22px;
            cursor: pointer;
            border: 2px solid white;
            border-radius: 4px;
            background: transparent;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            position: relative;
            vertical-align: middle;
            margin-right: 0.5rem;
            transition: background-color 0.2s, border-color 0.2s;
        }
        #round:checked, #bbb:checked {
            background-color: var(--color1);
            border-color: var(--color1);
        }
        #round:checked::after, #bbb:checked::after {
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

        /* ========== Buttons ========== */
        button {
            border: 1px solid white;
            background: black;
            color: white;
            text-transform: uppercase;
            letter-spacing: .1em;
            font-family: inherit;
            padding: .6rem 1rem;
            cursor: pointer;
            transition: background .2s, color .2s;
        }

        button:hover {
        }

        #calculate {
            color: color-mix(in srgb, var(--color1) 40%, white);
            border-color: color-mix(in srgb, var(--color1) 40%, white);
        }
        #edit {
            color: color-mix(in srgb, var(--color3) 40%, white);
            border-color: color-mix(in srgb, var(--color3) 40%, white);
        }

        #clear {
            color: color-mix(in srgb, var(--color5) 40%, white);
            border-color: color-mix(in srgb, var(--color5) 40%, white);
        }

        #copy {
            color: color-mix(in srgb, var(--color2) 40%, white);
            border-color: color-mix(in srgb, var(--color2) 40%, white);
        }

        /* Grouped buttons */
        .button-row {
            display: flex;
            flex-direction: column;
            gap: .5rem;
        }
        @media (min-width: 480px) {
            .button-row {
                flex-direction: row;
            }
        }

        /* ===========================
           TABLE STYLING
           =========================== */
        #output table {
            width: 100%;
            border-collapse: collapse;
            margin-top: .75rem;
            font-size: .9rem;
        }
        #output tr.week {
            font-size:2em;
        }
        #output th, #output td {
            padding: 6px;
            border-bottom: 1px solid #222;
        }
        #output th {
            text-align: left;
        }
        #output tr.headings {
            opacity:.5;
        }
        #output td:last-child {
            text-align: left;
            font-weight: bold;
            font-size:1.25em;
        }

        /* Table scroll for narrow screens */
        #output {
            overflow-x: auto;
        }

        /* ===========================
           DESKTOP ENHANCEMENTS
           =========================== */
        @media (min-width: 768px) {
            form {
                max-width: 720px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                align-items: stretch;
            }
            .button-row {
                grid-column: 1 / 3;
                justify-content: space-between;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <h1>5/3/1 Calculator</h1>
    <form id="calcForm" onsubmit="return false;">
        <label><span>Input Type</span>
            <select id="mode">
                <option value="tm">Training Max (90% of 1RM)</option>
                <option value="1rm">One-Rep Max</option>
            </select>
        </label>
        <label><span>Back Squat</span><input id="squat" type="number" min="0" step="1" placeholder="lbs"></label>
        <label><span>Bench Press</span><input id="bench" type="number" min="0" step="1" placeholder="lbs"></label>
        <label><span>Deadlift</span><input id="deadlift" type="number" min="0" step="1" placeholder="lbs"></label>
        <label><span>Overhead Press</span><input id="press" type="number" min="0" step="1" placeholder="lbs"></label>
        <label class="checkbox_wrapper">
            <input id="round" type="checkbox" checked> Round weights to nearest 5 lbs
        </label>
        <label class="checkbox_wrapper">
            <input id="bbb" type="checkbox"> Include Boring But Big (5×10 @ 50%)
        </label>
    </form>
    <div style="grid-column:1/3;display:flex;gap:8px;margin-top:1rem;">
        <button id="calculate" style="width:100%;">Calculate</button>
        <button id="edit" style="display:none;">Edit Inputs</button>
        <button id="clear" style="display:none;">Clear Saved</button>
        <button id="copy" style="display:none;">Copy Table</button>
    </div>
    <div id="output" style="display:none;"></div>
    <small>This calculator runs entirely in your browser. Inputs are saved locally in cookies.</small>
</div>

<script>
    (function(){
        const lifts = ['squat','bench','deadlift','press'];
        const weeks = [
            [{p:65,r:5},{p:75,r:5},{p:85,r:'5+'}],
            [{p:70,r:3},{p:80,r:3},{p:90,r:'3+'}],
            [{p:75,r:5},{p:85,r:3},{p:95,r:'1+'}]
        ];

        const prefix='h531_';
        const days=365;

        function setCookie(k,v){
            const d=new Date();
            d.setTime(d.getTime()+days*24*60*60*1000);
            document.cookie=`${prefix+k}=${v};expires=${d.toUTCString()};path=/`;
        }
        function getCookie(k){
            const m=document.cookie.match('(^|;)\\s*'+prefix+k+'\\s*=\\s*([^;]+)');
            return m?decodeURIComponent(m.pop()):'';
        }
        function eraseCookie(k){setCookie(k,'',-1);}
        function round(n,step){return Math.round(n/step)*step;}
        function saveForm(){
            setCookie('mode',mode.value);
            setCookie('round',roundBox.checked?'1':'0');
            setCookie('bbb', bbbBox.checked ? '1' : '0');
            lifts.forEach(l=>setCookie(l,document.getElementById(l).value));
        }
        function loadForm(){

            let anyLiftCookie = false;
            let allLiftCookiesExist = true;
            lifts.forEach(l=>{
                const v=getCookie(l);
                if(v) anyLiftCookie = true;
                if(!v) allLiftCookiesExist = false;
                if(v) document.getElementById(l).value=v;
            });
            if(getCookie('mode')) mode.value=getCookie('mode');
            roundBox.checked=(getCookie('round')==='1');
            bbbBox.checked = (getCookie('bbb') === '1');
            const form = document.getElementById('calcForm');
            const output = document.getElementById('output');
            const clearBtn = document.getElementById('clear');
            const copyBtn = document.getElementById('copy');
            const calculateBtn = document.getElementById('calculate');
            const editBtn = document.getElementById('edit');

            if(anyLiftCookie) {
                // Hide form and calculate button, show output and clear/copy/edit buttons
                form.style.display = 'none';
                calculateBtn.style.display = 'none';
                output.style.display = 'block';
                clearBtn.style.display = 'inline-block';
                copyBtn.style.display = 'inline-block';
                editBtn.style.display = 'inline-block';
                calc(); // Calculate and show output based on saved cookies
            } else {
                // Show form and calculate button, hide output and other buttons
                form.style.display = 'flex';
                calculateBtn.style.display = 'inline-block';
                output.style.display = 'none';
                clearBtn.style.display = 'none';
                copyBtn.style.display = 'none';
                editBtn.style.display = 'none';
                output.innerHTML = '';
            }
        }

        function calc(){
            saveForm();
            const is1RM = (mode.value === '1rm');
            const useRound = roundBox.checked;
            const out = document.getElementById('output');
            out.innerHTML = `<h3>${is1RM ? '1RM Input' : 'Training Max Input'}</h3>`;
            let anyTableCreated = false;

            // --- Begin new week-based table output ---
            weeks.forEach((w, weekIndex) => {
                const tbl = document.createElement('table');
                if (bbbBox.checked) {
                    tbl.classList.add('has-bbb');
                }
                tbl.innerHTML = `
                    <thead>
                        <tr class="week"><th colspan="3">Week ${weekIndex + 1}</th></tr>
                        <tr class="headings"><th>Lift</th><th>Set</th><th>Weight</th></tr>
                    </thead>
                    <tbody></tbody>
                `;

                let liftInWeek = false;
                lifts.forEach(liftName => {
                    const v = parseFloat(document.getElementById(liftName).value) || 0;
                    if (!v) return;
                    liftInWeek = true;
                    const tm = is1RM ? v * 0.9 : v;

                    // --- Begin new per-lift row logic ---
                    let setIndex = 0;
                    const liftClass = 'lift-' + liftName;
                    w.forEach((s, idx) => {
                        const wgt = useRound
                            ? round(tm * s.p / 100, 5)
                            : (tm * s.p / 100).toFixed(1);
                        const isFirst = setIndex === 0;
                        const isLast = setIndex === w.length - 1;
                        const liftLabel = isFirst ? liftName.toUpperCase() : '';

                        tbl.tBodies[0].innerHTML += `
                            <tr class="${liftClass}">
                                <td>${liftLabel}</td>
                                <td>${s.r} reps @ ${s.p}%</td>
                                <td>${wgt}</td>
                            </tr>
                        `;
                        setIndex++;
                    });
                    if (bbbBox.checked) {
                        const bbbWeight = useRound
                            ? round(tm * 0.5, 5)
                            : (tm * 0.5).toFixed(1);

                        tbl.tBodies[0].innerHTML += `
                            <tr class="${liftClass} bbb-row">
                                <td></td>
                                <td>5×10 @ 50%</td>
                                <td>${bbbWeight}</td>
                            </tr>
                        `;
                    }
                    // --- End per-lift row logic ---
                });
                if (liftInWeek) {
                    out.appendChild(tbl);
                    anyTableCreated = true;
                }
            });
            // --- End new week-based table output ---

            const clearBtn = document.getElementById('clear');
            const copyBtn = document.getElementById('copy');
            const form = document.getElementById('calcForm');
            const calculateBtn = document.getElementById('calculate');
            const editBtn = document.getElementById('edit');

            if(anyTableCreated){
                // Hide form and calculate button, show output and clear/copy/edit buttons
                form.style.display = 'none';
                calculateBtn.style.display = 'none';
                out.style.display = 'block';
                clearBtn.style.display = 'inline-block';
                copyBtn.style.display = 'inline-block';
                editBtn.style.display = 'inline-block';
            } else {
                // Show form and calculate button, hide output and other buttons
                form.style.display = 'flex';
                calculateBtn.style.display = 'inline-block';
                out.style.display = 'none';
                clearBtn.style.display = 'none';
                copyBtn.style.display = 'none';
                editBtn.style.display = 'none';
                out.innerHTML = '';
            }
        }

        const mode=document.getElementById('mode');
        const roundBox=document.getElementById('round');
        const bbbBox=document.getElementById('bbb');
        document.getElementById('calculate').addEventListener('click',calc);
        document.getElementById('clear').addEventListener('click',()=>{
            ['mode','round','bbb',...lifts].forEach(eraseCookie);
            const form = document.getElementById('calcForm');
            const output = document.getElementById('output');
            const clearBtn = document.getElementById('clear');
            const copyBtn = document.getElementById('copy');
            const calculateBtn = document.getElementById('calculate');
            const editBtn = document.getElementById('edit');

            form.reset();
            output.innerHTML = '';
            output.style.display = 'none';
            form.style.display = 'flex';
            calculateBtn.style.display = 'inline-block';
            clearBtn.style.display = 'none';
            copyBtn.style.display = 'none';
            editBtn.style.display = 'none';
        });
        document.getElementById('copy').addEventListener('click',()=>{
            const text=document.getElementById('output').innerText;
            if(text) navigator.clipboard.writeText(text);
        });
        document.getElementById('edit').addEventListener('click', () => {
            const form = document.getElementById('calcForm');
            const output = document.getElementById('output');
            const clearBtn = document.getElementById('clear');
            const copyBtn = document.getElementById('copy');
            const calculateBtn = document.getElementById('calculate');
            const editBtn = document.getElementById('edit');

            form.style.display = 'flex';
            output.style.display = 'none';
            clearBtn.style.display = 'none';
            copyBtn.style.display = 'none';
            editBtn.style.display = 'none';
            calculateBtn.style.display = 'inline-block';
        });
        document.querySelectorAll('#calcForm input,#calcForm select')
            .forEach(el=>el.addEventListener('change',saveForm));

        loadForm();
    })();
</script>
</body>
</html>