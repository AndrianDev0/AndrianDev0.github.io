"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

type StickerScene = "hero" | "work" | "contact" | "keyboard";
const characters = { hero: "tongue", work: "wink", contact: "love", keyboard: "smile" } as const;
type Character = (typeof characters)[StickerScene];
const animationRequests = new Map<Character, Promise<unknown>>();

function loadAnimationData(kind: Character) {
  let request = animationRequests.get(kind);
  if (!request) {
    request = fetch(`/emoji/mickey/${kind}.json`).then(response => {
      if (!response.ok) throw new Error("Emoji unavailable");
      return response.json();
    }).catch(error => {
      animationRequests.delete(kind);
      throw error;
    });
    animationRequests.set(kind, request);
  }
  // Lottie mutates its data; each mounted scene needs its own copy.
  return request.then(data => structuredClone(data));
}

export function StickerBackdrop({ scene, playing = false, reaction = false }: { scene: StickerScene; playing?: boolean; reaction?: boolean }) {
  const kind = characters[scene];
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "static" | "error">("loading");
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
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    let animation: AnimationItem | undefined;
    let inView = false;
    let nearby = scene === "hero";
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
        const [module, animationData] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          loadAnimationData(kind),
        ]);
        if (disposed) return;
        animation = module.default.loadAnimation({
          container, animationData, renderer: "svg", loop: false, autoplay: false,
          rendererSettings: { progressiveLoad: false, preserveAspectRatio: "xMidYMid meet" },
        });
        animation.addEventListener("DOMLoaded", () => {
          if (disposed) return;
          ready = true;
          setState(motion.matches || connection?.saveData ? "static" : "ready");
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
    const requestLoad = () => {
      if (motion.matches || connection?.saveData) {
        setState("static");
        return;
      }
      void load();
    };
    const preferencesChanged = () => {
      if (motion.matches || connection?.saveData) setState("static");
      else if (ready) setState("ready");
      else if (nearby) requestLoad();
      update();
    };
    // Prepare lower-page scenes before they enter the screen, but play only in view.
    const preloadObserver = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      nearby = true;
      requestLoad();
      preloadObserver?.disconnect();
    }, { rootMargin: "400px 0px" }) : undefined;
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) requestLoad();
      update();
    }, { threshold: 0.25 }) : undefined;
    if (observer) {
      observer.observe(node);
      if (scene === "hero") requestLoad();
      else preloadObserver?.observe(node);
    } else { inView = true; nearby = true; requestLoad(); }
    motion.addEventListener("change", preferencesChanged);
    connection?.addEventListener("change", preferencesChanged);
    document.addEventListener("visibilitychange", update);
    return () => {
      disposed = true;
      if (scene === "keyboard") syncKeyboard.current = undefined;
      window.clearTimeout(replayTimer);
      preloadObserver?.disconnect();
      observer?.disconnect();
      animation?.destroy();
      motion.removeEventListener("change", preferencesChanged);
      connection?.removeEventListener("change", preferencesChanged);
      document.removeEventListener("visibilitychange", update);
    };
  }, [kind, scene]);

  return (
    <div ref={ref} className={`sticker-backdrop sticker-backdrop-${scene}`} aria-hidden="true" data-state={state} data-active={active} data-emoji={kind}>
      <img className="sticker-poster mickey-emoji" src={`/emoji/mickey/${kind}.svg`} alt="" width={512} height={512}
        loading={scene === "hero" ? "eager" : "lazy"} fetchPriority={scene === "hero" ? "high" : "auto"} decoding="async" />
      <span ref={canvasRef} className="floating-sticker mickey-emoji" />
    </div>
  );
}
