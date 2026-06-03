const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let musicPlaying = false;
let musicNodes = [];

// Melody, Bass, Chords data (your original arrays)
const melody = [     // Phrase A — opening motif (from ~11s): G -> C# -> D -> C# -> C
    [392.00, 0.18],  // G4
    [0,      0.08],
    [277.18, 0.12],  // C#4
    [293.66, 0.18],  // D4
    [277.18, 0.20],  // C#4
    [261.63, 0.28],  // C4
    [0,      0.14],

    // Phrase B — descending minor (from ~20s): G# -> G -> F -> E -> D#
    [415.30, 0.28],  // G#4
    [392.00, 0.14],  // G4
    [392.00, 0.14],  // G4
    [349.23, 0.18],  // F4
    [329.63, 0.16],  // E4
    [311.13, 0.32],  // D#4
    [0,      0.10],

    // Phrase C — ornamental D#/D oscillation (from ~25s)
    [311.13, 0.12],  // D#4
    [293.66, 0.10],  // D4
    [311.13, 0.12],  // D#4
    [293.66, 0.10],  // D4
    [311.13, 0.10],  // D#4
    [293.66, 0.10],  // D4
    [311.13, 0.12],  // D#4
    [293.66, 0.28],  // D4
    [261.63, 0.32],  // C4
    [0,      0.12],

    // Phrase D — climbing resolve (from ~34s): F -> G -> E -> D -> C
    [349.23, 0.16],  // F4
    [392.00, 0.20],  // G4
    [329.63, 0.20],  // E4
    [293.66, 0.18],  // D4
    [261.63, 0.30],  // C4
    [277.18, 0.18],  // C#4
    [293.66, 0.14],  // D4
    [261.63, 0.36],  // C4
    [0,      0.14],

    // Phrase E — upper arch (from ~47s): A -> G -> F# -> G -> F -> E -> D#
    [440.00, 0.12],  // A4
    [392.00, 0.10],  // G4
    [369.99, 0.18],  // F#4
    [392.00, 0.14],  // G4
    [493.88, 0.14],  // B4
    [392.00, 0.10],  // G4
    [349.23, 0.28],  // F4
    [329.63, 0.14],  // E4
    [311.13, 0.32],  // D#4
    [0,      0.10],

    // Phrase F — final resolution (from ~57s): G -> E -> F -> E -> D# -> C
    [392.00, 0.20],  // G4
    [329.63, 0.14],  // E4
    [349.23, 0.10],  // F4
    [329.63, 0.22],  // E4
    [349.23, 0.10],  // F4
    [329.63, 0.14],  // E4
    [311.13, 0.12],  // D#4
    [293.66, 0.12],  // D4
    [261.63, 0.40],  // C4
    [0,      0.18], ];
const bass = [ [130.81, 0.28], [0, 0.08],  // C3
    [130.81, 0.28], [0, 0.08],  // C3
    [146.83, 0.28], [0, 0.08],  // D3
    [130.81, 0.28], [0, 0.08],  // C3
    [98.00,  0.28], [0, 0.08],  // G2
    [98.00,  0.28], [0, 0.08],  // G2
    [110.00, 0.28], [0, 0.08],  // A2
    [130.81, 0.28], [0, 0.08],  // C3];
]
const chords = [     [[261.63, 311.13, 392.00], 0.08],  // Cm (C D# G)
    [[261.63, 311.13, 392.00], 0.08],
    [[293.66, 349.23, 440.00], 0.08],  // Dm (D F A)
    [[261.63, 311.13, 392.00], 0.08],
    [[196.00, 233.08, 293.66], 0.08],  // Gm (G A# D)
    [[196.00, 233.08, 293.66], 0.08],
    [[220.00, 261.63, 329.63], 0.08],  // Am (A C E)
    [[261.63, 311.13, 392.00], 0.08],  // Cm ];
]

function playMusic() {
    if (musicPlaying) return;
    musicPlaying = true;
    // ... your full playLayer, playBassLayer, playPadLayer logic ...
    function playLayer(sequence, gainLevel, loop) {
        let when = audioCtx.currentTime + 0.05;

        function scheduleSequence() {
            sequence.forEach(([freq, dur]) => {
                if (freq === 0) { when += dur; return; }

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                // filter for warmth — cuts harsh high frequencies
                const filter = audioCtx.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.value = 1200;
                filter.Q.value = 0.8;

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);

                osc.type = "sine";  // ← smooth instead of square
                osc.frequency.value = freq;

                // legato envelope — slow attack, long release, notes overlap slightly
                const attack  = 0.06;
                const release = Math.min(dur * 0.6, 0.25);
                gain.gain.setValueAtTime(0, when);
                gain.gain.linearRampToValueAtTime(gainLevel, when + attack);
                gain.gain.setValueAtTime(gainLevel, when + dur - release);
                gain.gain.linearRampToValueAtTime(0, when + dur + 0.05); // slight overlap

                osc.start(when);
                osc.stop(when + dur + 0.1);
                musicNodes.push(osc);
                when += dur;
            });

            if (loop && musicPlaying) {
                const loopDuration = when - audioCtx.currentTime;
                setTimeout(scheduleSequence, (loopDuration - 0.3) * 1000);
            }
        }
        scheduleSequence();
    }

    function playBassLayer(sequence, gainLevel, loop) {
        let when = audioCtx.currentTime + 0.05;

        function scheduleSequence() {
            sequence.forEach(([freq, dur]) => {
                if (freq === 0) { when += dur; return; }

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                // warmer bass — triangle wave, lowpass filtered
                const filter = audioCtx.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.value = 400;

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);

                osc.type = "triangle";
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, when);
                gain.gain.linearRampToValueAtTime(gainLevel, when + 0.08);
                gain.gain.linearRampToValueAtTime(gainLevel * 0.7, when + dur * 0.5);
                gain.gain.linearRampToValueAtTime(0, when + dur + 0.08);

                osc.start(when);
                osc.stop(when + dur + 0.12);
                musicNodes.push(osc);
                when += dur;
            });

            if (loop && musicPlaying) {
                const loopDuration = when - audioCtx.currentTime;
                setTimeout(scheduleSequence, (loopDuration - 0.3) * 1000);
            }
        }
        scheduleSequence();
    }

    function playPadLayer(sequence, gainLevel, loop) {
        let when = audioCtx.currentTime + 0.05;

        function scheduleSequence() {
            sequence.forEach(([freqs, dur]) => {
                freqs.forEach(freq => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();

                    const filter = audioCtx.createBiquadFilter();
                    filter.type = "lowpass";
                    filter.frequency.value = 800;
                    filter.Q.value = 0.5;

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);

                    osc.type = "sine";

                    // detune slightly per voice for lush pad effect
                    osc.frequency.value = freq;
                    osc.detune.value = (Math.random() - 0.5) * 6;

                    // very slow attack/release — pad swells in and out
                    const padDur = dur + 0.28;
                    gain.gain.setValueAtTime(0, when);
                    gain.gain.linearRampToValueAtTime(gainLevel, when + 0.18);
                    gain.gain.linearRampToValueAtTime(gainLevel * 0.8, when + padDur - 0.15);
                    gain.gain.linearRampToValueAtTime(0, when + padDur + 0.1);

                    osc.start(when);
                    osc.stop(when + padDur + 0.15);
                    musicNodes.push(osc);
                });
                when += dur + 0.28;
            });

            if (loop && musicPlaying) {
                const loopDuration = when - audioCtx.currentTime;
                setTimeout(scheduleSequence, (loopDuration - 0.3) * 1000);
            }
        }
        scheduleSequence();
    }

    playLayer(melody,       0.10, true);   // lead — sine, legato
    playBassLayer(bass,     0.14, true);   // bass — triangle, warm
    playPadLayer(chords,    0.03, true);   // chords — soft sine pad
}

function playCorrectSound() {
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.3);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, audioCtx.currentTime + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.35);
    gain2.gain.setValueAtTime(0.0, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.4);
}

function playWrongSound() {
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.2);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.2);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = "square";
    osc2.frequency.setValueAtTime(150, audioCtx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.0, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc2.start(audioCtx.currentTime + 0.05);
    osc2.stop(audioCtx.currentTime + 0.25);
}