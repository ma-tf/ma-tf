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

`blog/bird.ogg`, `misc/rock.ogg` and `photograph/camera.ogg` carry this encode's
signature: Ogg Vorbis, mono, 16 kHz, ~16 kbps nominal (~39 kbps effective), one
to one and a half seconds, 6–7 KB each. A new effect that lands far off that
shape is either too long or was encoded with different flags.
