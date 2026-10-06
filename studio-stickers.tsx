"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

type StickerScene = "hero" | "work" | "contact" | "keyboard";
const characters = { hero: "tongue", work: "wink", contact: "love", keyboard: "smile" } as const;

export function StickerBackdrop({ scene, playing = false, reaction = false }: { scene: StickerScene; playing?: boolean; reaction?: boolean }) {
  const kind = characters[scene];
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [active, setActive] = useState(false);
  const keyboardControls = useRef({ playing, reaction });
  const syncKeyboard = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    keyboardControls.current = { playing, reaction };
    syncKeyboard.current?.();
  }, [playing, reaction]);

  useEffect(() => {
    const node = ref.current;
    const container = canvasRef.current;
    if (!node || !container) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const controller = new AbortController();
    let animation: AnimationItem | undefined;
    let inView = false;
    let requested = false;
    let ready = false;
    let played = false;
    let disposed = false;
    let replayTimer: number | undefined;
    let reacting = false;
    let previousReaction = false;
    const update = () => {
      if (!animation || !ready || disposed) return;
      if (motion.matches || connection?.saveData) {
        animation.goToAndStop(0, true);
        reacting = false;
        setActive(false);
      } else if (scene === "keyboard") {
        const controls = keyboardControls.current;
        const triggered = controls.reaction && !previousReaction;
        previousReaction = controls.reaction;
        if (!controls.playing || !inView || document.hidden) {
          animation.pause();
          setActive(false);
        } else if (triggered && !reacting) {
          reacting = true;
          animation.goToAndPlay(0, true);
          setActive(true);
        } else if (reacting) {
          animation.play();
          setActive(true);
        }
      } else if (!inView || document.hidden || played) {
        animation.pause();
        setActive(false);
      } else {
        animation.play();
        setActive(true);
      }
    };
    if (scene === "keyboard") syncKeyboard.current = update;
    const load = async () => {
      if (requested) return;
      requested = true;
      try {
        const [module, response] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          fetch(`/emoji/mickey/${kind}.json`, { signal: controller.signal }),
        ]);
        if (!response.ok) throw new Error("Emoji unavailable");
        const animationData = await response.json();
        if (disposed) return;
        animation = module.default.loadAnimation({
          container, animationData, renderer: "svg", loop: false, autoplay: false,
          rendererSettings: { progressiveLoad: false, preserveAspectRatio: "xMidYMid meet" },
        });
        animation.addEventListener("DOMLoaded", () => {
          if (disposed) return;
          ready = true;
          setState("ready");
          update();
        });
        animation.addEventListener("complete", () => {
          played = true;
          reacting = false;
          setActive(false);
          if ((scene === "hero" || scene === "work") && !motion.matches && !connection?.saveData) {
            replayTimer = window.setTimeout(() => {
              if (disposed) return;
              played = false;
              animation?.goToAndStop(0, true);
              update();
            }, 4000);
          }
        });
        animation.addEventListener("data_failed", () => {
          if (!disposed) { setState("error"); setActive(false); }
        });
      } catch {
        if (!disposed) setState("error");
      }
    };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) void load();
      update();
    }, { threshold: 0.25 }) : undefined;
    if (observer) observer.observe(node);
    else { inView = true; void load(); }
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      disposed = true;
      if (scene === "keyboard") syncKeyboard.current = undefined;
      window.clearTimeout(replayTimer);
      controller.abort();
      observer?.disconnect();
      animation?.destroy();
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [kind, scene]);

  return (
    <div ref={ref} className={`sticker-backdrop sticker-backdrop-${scene}`} aria-hidden="true" data-state={state} data-active={active} data-emoji={kind}>
      <span ref={canvasRef} className="floating-sticker mickey-emoji" />
    </div>
  );
}
