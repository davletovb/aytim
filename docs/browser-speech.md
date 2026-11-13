# Speaking checks: browser recognition and keyboard voice typing

A lesson's speaking turn checks what the learner said against the phrase. It
uses only what the device itself offers:

1. **The browser's Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`), through the microphone button.
2. **The keyboard's own voice typing** (Gboard and iOS dictation on phones; `Win + H` on Windows and
   dictation (`Fn` twice) on a Mac), which types the phrase into a text box.

**Aytim never receives the audio or the transcript.** There is no Azure Speech-to-Text,
no upload to the Worker, D1 or R2, and no on-device model download. The browser or the
keyboard may use its vendor's own recognition service. The check is formative: it is not
a pronunciation grade and never changes the lesson score.

## Which one a learner sees

| Where | Speaking card |
| --- | --- |
| Website in a browser with the Web Speech API (e.g. Chrome, Edge, Safari) | Microphone button; "Use keyboard voice typing" opens the text box as a fallback |
| Telegram in a web browser (`weba`, `webk`, `web`) | Same as the website |
| Telegram's own apps (`android`, `ios`, `macos`, `tdesktop`, `unigram`) | Text box for the keyboard's voice typing, no microphone button |
| Browser without the API (e.g. Firefox) | Text box |
| After the microphone failed in a way a retry will not fix | The button is disabled, the text box opens, and later speaking turns in this session start with it |

Telegram's own apps show Mini Apps in a system web view without a speech recognition
service: the API is missing or fails at once, whatever the page does. Their keyboards
still offer voice typing, so that is the method there. `nativeTelegramApp()` in
`dist/browser-speech.mjs` decides by `Telegram.WebApp.platform`.

## How a microphone attempt ends

`startSpeechCheck()` in `dist/browser-speech.mjs` runs one attempt and reports exactly one
outcome, whatever the browser does:

- **A final transcript** is checked at once; the attempt does not wait for the browser's `end` event.
- **Interim text** is shown while listening ("Heard so far"). If the browser ends without a final
  transcript, the last interim text is checked.
- **Pressing the button again** stops listening and asks for the final text. If the browser never
  answers, the attempt ends after 4 seconds anyway. Stopping before anything was heard simply resets the card.
- **Errors** have their own messages: no speech, speech heard but not recognized (`nomatch`), microphone
  denied or busy, network, recognition service unavailable, and language not supported. Every message
  points to the keyboard's voice typing; none asks the learner to switch browser.
- **Leaving the question** cancels quietly.

The best attempt of the turn counts: a retry that fails does not undo an earlier match. Arabic uses the
locale `ar-SA` for Modern Standard Arabic; the other languages use their usual locale.

## Manual checklist on real devices

1. Chrome on Android and desktop, Safari on iOS and macOS: start, stop, interim text, a matching and a
   different phrase, in all six target languages (Uzbek and Arabic especially).
2. Deny the microphone, and pick a language the browser cannot recognize: the message explains it and
   the text box opens.
3. Telegram on Android, iOS and desktop: the text box is shown; keyboard voice typing fills it in the
   target language (the keyboard's voice input language may need switching) and Check marks the phrase.
4. Telegram Web in a browser: the microphone works as on the website.
5. Navigate away while listening: nothing changes afterwards, and no audio or transcript appears in
   requests to `/api/`, in D1 or in progress exports.
