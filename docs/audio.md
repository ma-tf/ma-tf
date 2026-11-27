# Audio

Sound effects are short, mono, 16 kHz Vorbis. Music is a separate, much larger
asset with its own budget, so it does not follow this pipeline.

## Encoding a sound effect

Run this on the machine holding the source WAV, not inside the repo. The source
never ships; only the `.ogg` does.

```sh
ffmpeg -y -i camera.wav -c:a libvorbis -compression_level 10 \
  -b:a 16k -ac 1 -ar 16000 -vn camera.ogg
```

| Flag                    | Effect                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `-y`                    | Overwrite the output without prompting                                                                     |
| `-c:a libvorbis`        | Name the encoder explicitly; the native `vorbis` fallback is experimental and ignores `-compression_level` |
| `-compression_level 10` | Slowest libvorbis search, smallest output                                                                  |
| `-b:a 16k`              | Nominal 16 kbps                                                                                            |
| `-ac 1`                 | Mono                                                                                                       |
| `-ar 16000`             | 16 kHz; ample for one-shot effects                                                                         |
| `-vn`                   | Drop any video stream                                                                                      |

Quote paths that contain spaces, and close the quote.

## Shipped profile

`blog/bird.ogg`, `misc/rock.ogg` and `photography/camera.ogg` carry this encode's
signature: Ogg Vorbis, mono, 16 kHz, ~16 kbps nominal (~39 kbps effective), one
to one and a half seconds, 6–7 KB each. A new effect that lands far off that
shape is either too long or was encoded with different flags.

## Interaction sound

`src/lib/sfx.ts` gives interaction-based animations one shared sound.
`playSfx()` plays `public/menu2.ogg` through Web Audio at 0.1 gain; `startSfx()` fetches and
decodes it up front. It stays silent until that finishes and before the first
user activation, drops the sound while the `AudioContext` is not running, and
collapses calls within 80ms into one. Sounds play one at a time: a new sound
fades out the one still playing over 40ms. It ignores the
music volume and still plays under reduced motion.

The header's `SfxToggle` mutes through `setSfxMuted()`, stored as `sfx-muted` in
localStorage. A sound that does not go through `playSfx()` (pigeon, cameras,
rock ball) must check `isSfxMuted()` itself. Music is unaffected.

### The `data-sfx` contract

`Layout.astro` calls `startSfx()` once, which delegates from `document`. Mark an
element with space-separated tokens, matching only the triggers that animate it:

| Token   | Plays when                                                                     |
| ------- | ------------------------------------------------------------------------------ |
| `hover` | A mouse or pen pointer enters; moves between descendants and touch are skipped |
| `focus` | `:focus-visible` focus enters the element or a descendant                      |
| `click` | The element is clicked, including by keyboard activation                       |
| `leave` | The pointer or focus leaves an element it entered, as `hover` or `focus`       |

`data-sfx-enter` and `data-sfx-leave` pick the sound for the entering and leaving
triggers: `up` (`menu3up.ogg`) or `down` (`menu3down.ogg`), else `menu2.ogg`. The
home titles use `up` and `down`. The 80ms merge applies per sound. A host with `data-sfx-settle` waits for the
`--open-delay` custom property before its enter sound, and skips it if the
pointer has left by then; `html[data-switching]` sets that property to 150ms while a home title is open and
for 150ms after it closes (`src/lib/home-switch.ts`).

A `hover` repeated on the same element at the same pointer position is ignored:
browsers re-fire it after a view transition without the pointer moving.

Call `playSfx()` directly only where an attribute cannot express the trigger:
`useSfxOnChange` (dialogs open and close by any route), the command palette's
toasts, swipe and Escape toast dismissal, and the tag orbit's front item.

### Replacing the sound

Encode the file as above into `public/` and point `SOUND_URL` in `sfx.ts` at it.
Call sites and attributes do not change.
