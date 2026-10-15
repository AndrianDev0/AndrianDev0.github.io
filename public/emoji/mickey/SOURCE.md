# Mickey Mouse Emoji

Requested by the portfolio owner, matching the supplied black-and-white reference.

Telegram pack: https://t.me/addemoji/MickeyMouseEmoji

Animation catalogue: https://tgstickers.su/emoji/mickeymouseemoji/

Original Lottie animations downloaded on 2026-10-06:

- smile.json: https://tgstickers.su/data/MickeyMouseEmoji/MickeyMouseEmoji_001.json
- wink.json: https://tgstickers.su/data/MickeyMouseEmoji/MickeyMouseEmoji_005.json
- love.json: https://tgstickers.su/data/MickeyMouseEmoji/MickeyMouseEmoji_006.json
- tongue.json: https://tgstickers.su/data/MickeyMouseEmoji/MickeyMouseEmoji_008.json (catalogue expression: 😋). Selected for the hero at the owner's request.

Each source is 512 by 512, 60 fps, 180 frames. Original path animation is preserved.
The website displays these monochrome assets in white on dark backgrounds and black on light backgrounds.
The hero and work characters repeat their original animations after a four-second rest; the contact scene retains one-shot playback. All scenes pause offscreen and respect reduced-motion/data-saving preferences.

Loading optimization (2026-10-16): removed editor-only metadata and zero-width strokes from the JSON files. Paths, keyframes, frame rate and timing are unchanged. Seven frames from each animation were rendered before and after optimization and compared at 256 px: all 28 samples are pixel-identical.

The matching SVG files are frame 0 exported from these same animations using lottie-web 5.13.0. They provide the initial image, the reduced-motion/data-saving version and the fallback if animation loading fails. The hero image is preloaded on home pages; the animation starts loading on mount. Lower-page animations prepare within 400 px of the viewport and only play when visible. JSON requests are shared across mounts, with a separate data copy for each Lottie instance.
