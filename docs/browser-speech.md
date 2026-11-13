# Browser speech-recognition troubleshooting

Aytim's lesson speaking turn uses **the browser's Web Speech API** (`SpeechRecognition` or `webkitSpeechRecognition`). **It does not use Azure Speech-to-Text** and does not send audio or transcripts to the Aytim Worker, D1, or R2. The app uses the recognized text to compare against the target phrase; it does not score pronunciation or control lesson unlocking.

## Why microphone permission may not be enough

An enabled microphone does not imply that the browser's recognition service works. A browser may expose `webkitSpeechRecognition` but stop immediately because its underlying speech service is blocked, unreachable, or does not support the selected language. Many browsers use a remote recognition service behind their Web Speech API; this is controlled by the browser, not Aytim. Some browsers have optional local speech recognition, but its availability depends on on-device language packs and browser support. Aytim does **not** promise fully offline speech recognition.

The UI now distinguishes these cases:
- **Microphone denied / audio-capture:** check site microphone permissions and active device input.
- **No speech:** wait until listening starts, check the selected microphone and speak clearly.
- **Network / service-not-allowed:** the browser's recognizer is unavailable; try a supported browser such as Chrome or Safari, and check browser-specific privacy restrictions.
- **Language-not-supported:** the browser may not have a recognition engine for the target language.
- **Ended without text:** the recognizer closed without producing a transcript; the learner can retry or continue.

Press the mic to start listening, then speak the phrase; pressing it again stops and requests the final result. Partial recognition text is shown while listening, but only a final transcript is compared with the reference. Navigation aborts the capture and discards transient recognition state.

## Manual acceptance checklist

1. Check permission denied vs granted in Chrome/Safari, and browsers that expose Web Speech recognition but block the service.
2. Test microphone start, explicit stop, interim results, final recognition and matching/nonmatching phrases in all six target languages, especially Arabic (explicit `ar-SA`) and Uzbek.
3. Confirm the button re-enables after `error` and `end` events, and that fast repeated taps do not start overlapping recognition sessions.
4. Confirm navigating away aborts recognition, speech feedback never changes the scored lesson denominator, and no audio/transcript appears in network calls to `/api/`, D1 or progress exports.
5. Test when no final transcript arrives. The learner must be able to continue without a false score or false claim that recognition succeeded.

If the browser cannot recognize a particular language, **a JavaScript UI change cannot make its proprietary recognition service support that language**. Browser-only alternatives require supported local language packs or an explicit, much larger on-device speech model; do not silently route speech to Azure.
