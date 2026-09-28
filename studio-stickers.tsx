"use client";

import { useState } from "react";
import { useLanguage } from "./i18n";

type StickerKind = "party" | "byte" | "ghost";

const stickers: { kind: StickerKind; ru: string; en: string }[] = [
  { kind: "party", ru: "Развеселить мятного чудика", en: "Cheer up the mint creature" },
  { kind: "byte", ru: "Подмигнуть оранжевому чудищу", en: "Wink at the orange creature" },
  { kind: "ghost", ru: "Напугать дружелюбное привидение", en: "Spook the friendly ghost" },
];

function PartySticker() {
  return (
    <svg viewBox="0 0 180 180" fill="none" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="170" height="170" rx="31" fill="#F7A744" stroke="#171713" strokeWidth="6" />
      <path d="M48 99c-5-12 2-30 17-36 3-15 19-24 35-18 15-3 29 7 31 22 13 8 18 24 12 37 5 18-6 36-25 40-17 13-43 10-56-3-18-2-25-20-14-42Z" fill="#A8E4CB" stroke="#171713" strokeWidth="5" strokeLinejoin="round" />
      <path d="m76 51 18-40 28 48-46-8Z" fill="#B792F3" stroke="#171713" strokeWidth="5" strokeLinejoin="round" />
      <path d="m88 25 25 28M83 38l19 12" stroke="#F4D267" strokeWidth="6" />
      <circle cx="94" cy="12" r="8" fill="#E9F36B" stroke="#171713" strokeWidth="4" />
      <path d="M55 92c9-8 22-8 31-2M104 88c9-7 22-5 28 1" stroke="#171713" strokeWidth="5" strokeLinecap="round" />
      <path d="M63 96c2 12 16 12 19 1M108 96c2 12 16 12 19 1" stroke="#171713" strokeWidth="4" strokeLinecap="round" />
      <path d="M84 118c8 12 24 12 32 0" stroke="#171713" strokeWidth="5" strokeLinecap="round" />
      <circle className="sticker-bubble" cx="132" cy="121" r="20" fill="#F6A2BC" stroke="#171713" strokeWidth="5" />
      <path d="M132 107c5 0 9 4 10 9" stroke="#FFF0EC" strokeWidth="4" strokeLinecap="round" />
      <path d="m34 45-6-4m120 17 6-5M40 143l-8 4" stroke="#171713" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ByteSticker() {
  return (
    <svg viewBox="0 0 180 180" fill="none" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="170" height="170" rx="31" fill="#B898EB" stroke="#171713" strokeWidth="6" />
      <path d="m90 24 17 19 26-1 5 24 21 16-15 21 5 24-25 7-15 21-23-10-25 10-13-21-24-8 6-24-15-20 21-16 5-24 26 1 23-19Z" fill="#F5CC62" stroke="#171713" strokeWidth="5" strokeLinejoin="round" />
      <path d="m50 82 35 3-5 24-26-3-4-24Zm46 3 35-3-4 24-26 3-5-24Z" fill="#222226" stroke="#171713" strokeWidth="4" strokeLinejoin="round" />
      <path d="m85 90 11 1M57 89l19 2m27 0 20-2" stroke="#CFB3FA" strokeWidth="3" strokeLinecap="round" />
      <path className="sticker-smile" d="M68 121c13 12 32 12 45-1" stroke="#171713" strokeWidth="6" strokeLinecap="round" />
      <path d="m29 29 10 4m105 5 7-9m-4 113 8 7" stroke="#171713" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function GhostSticker() {
  return (
    <svg viewBox="0 0 180 180" fill="none" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="170" height="170" rx="31" fill="#86D5BD" stroke="#171713" strokeWidth="6" />
      <path d="M45 123V85c0-27 19-47 45-47s45 20 45 47v54l-17-10-14 14-15-12-17 12-13-15-14 9v-14Z" fill="#F5EEE1" stroke="#171713" strokeWidth="5" strokeLinejoin="round" />
      <path d="M62 46 54 29m65 17 9-17" stroke="#171713" strokeWidth="4" strokeLinecap="round" />
      <path className="sticker-ghost-eye" d="M65 82c0-7 5-12 11-12s11 5 11 12v8H65v-8Zm29 0c0-7 5-12 11-12s11 5 11 12v8H94v-8Z" fill="#171713" />
      <circle cx="76" cy="77" r="3" fill="#F5EEE1" />
      <circle cx="105" cy="77" r="3" fill="#F5EEE1" />
      <path d="M82 109c6 6 13 6 19 0" stroke="#171713" strokeWidth="5" strokeLinecap="round" />
      <path d="m32 48-10-4m129 8 8-7m-8 94 9 5" stroke="#171713" strokeWidth="4" strokeLinecap="round" />
      <circle cx="55" cy="106" r="6" fill="#EF9BB4" opacity=".8" />
      <circle cx="125" cy="106" r="6" fill="#EF9BB4" opacity=".8" />
    </svg>
  );
}

const art = { party: PartySticker, byte: ByteSticker, ghost: GhostSticker };

export function StudioStickers() {
  const { language } = useLanguage();
  const [reaction, setReaction] = useState<{ kind: StickerKind; count: number } | null>(null);

  return (
    <div className="studio-stickers">
      {stickers.map(({ kind, ru, en }) => {
        const Art = art[kind];
        const playing = reaction?.kind === kind;
        return (
          <button
            key={kind}
            type="button"
            className={`studio-sticker studio-sticker-${kind}`}
            aria-label={language === "ru" ? ru : en}
            onClick={() => setReaction((current) => ({ kind, count: (current?.count ?? 0) + 1 }))}
          >
            <Art key={playing ? reaction.count : 0} />
          </button>
        );
      })}
    </div>
  );
}
