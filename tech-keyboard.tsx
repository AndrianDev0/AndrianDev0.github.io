"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { technologies } from "./content";
import { useLanguage } from "./i18n";
import { StickerBackdrop } from "./studio-stickers";
import { useMickeyPhysics } from "./use-mickey-physics";
import "./styles/tech-keyboard.css";

type Point = { x: number; y: number };
const icons = ["html5", "css", "javascript", "typescript", "react", "nextdotjs", "nodedotjs", "python", "telegram", null, "postgresql", "git"];
const sequence = [2, 4, 7, 10, 0, 5, 6, 9, 1, 11, 3, 8];

function Glove({ elementRef }: { elementRef: (node: HTMLDivElement | null) => void }) {
  return <div ref={elementRef} className="typing-glove">
    <svg viewBox="0 0 62 70" fill="none" aria-hidden="true">
      <path d="M15 11 43 10 46 22 42 29 48 37Q53 46 45 50L39 48 38 60Q37 69 30 65L27 52Q20 57 15 50L8 34Q5 27 12 24L17 28Z" fill="#fffdf8" stroke="#202019" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="m15 15 28-1M21 29l4 12m4-14 4 12m3-13 4 10" stroke="#202019" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>;
}

export function TechKeyboard() {
  const { language } = useLanguage();
  const ru = language === "ru";
  const root = useRef<HTMLDivElement>(null);
  const keys = useRef<(HTMLButtonElement | null)[]>([]);
  const handKeys = useRef({ left: 2, right: 3 });
  const [selected, setSelected] = useState(2);
  const [pressed, setPressed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [layout, setLayout] = useState<{ left: Point; right: Point; center: number; hand: "left" | "right" }>({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 }, center: 0, hand: "left" });
  const physicsEnabled = visible && pageVisible && !paused && !reduced;
  const nextKey = useCallback(() => setSelected(current => sequence[(sequence.indexOf(current) + 1) % sequence.length]), []);
  const physics = useMickeyPhysics({ enabled: physicsEnabled, reduced, layout, keys, selected, onPress: setPressed, onNext: nextKey });
  const running = physicsEnabled && !physics.dragging;

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(motion.matches || Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData));
    const visibility = () => setPageVisible(!document.hidden);
    update(); visibility();
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); motion.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    const measure = () => {
      const node = root.current;
      if (!node) return;
      const box = node.getBoundingClientRect();
      const position = (index: number) => {
        const key = keys.current[index]!.getBoundingClientRect();
        const transform = getComputedStyle(keys.current[index]!).transform;
        const depression = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
        return { x: key.x - box.x + key.width / 2, y: key.y - box.y - depression + 22 };
      };
      const target = position(selected);
      const hand = target.x < box.width / 2 ? "left" : "right";
      for (const side of ["left", "right"] as const) {
        const belongsToSide = (index: number) => (position(index).x < box.width / 2) === (side === "left");
        if (!belongsToSide(handKeys.current[side])) {
          handKeys.current[side] = keys.current.findIndex((_, index) => belongsToSide(index));
        }
      }
      handKeys.current[hand] = selected;
      setLayout({ center: box.width / 2, hand,
        left: position(handKeys.current.left),
        right: position(handKeys.current.right) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [selected]);

  return <div className="typing-studio">
    <div className="typing-toolbar">
      <span>{ru ? "Микки за работой" : "Mickey at work"}</span>
      <button type="button" onClick={() => setPaused(value => !value)} disabled={reduced}
        aria-pressed={paused} aria-label={ru ? (paused ? "Продолжить анимацию клавиатуры" : "Остановить анимацию клавиатуры") : (paused ? "Resume keyboard animation" : "Pause keyboard animation")}>
        {reduced ? (ru ? "Без анимации" : "Motion off") : paused ? (ru ? "Продолжить" : "Resume") : (ru ? "Пауза" : "Pause")}
      </button>
    </div>
    <div className="typing-scene" ref={root} data-running={running} data-selected={selected} data-pressed={pressed}>
      <button type="button" ref={physics.character} className="typing-character" data-dragging={physics.dragging}
        disabled={!physicsEnabled} aria-label={ru ? "Раскачать Микки" : "Give Mickey a nudge"}
        title={ru ? "Потяни и отпусти или нажми" : "Drag and release, or click"} {...physics.handlers}>
        <StickerBackdrop scene="keyboard" playing={running} reaction={pressed && sequence.indexOf(selected) % 3 === 0} />
      </button>
      <div className="typing-hands" aria-hidden="true" style={{ visibility: layout.center ? "visible" : "hidden" }}>
        <svg className="typing-arms">
          {(["left", "right"] as const).map(side => {
            const p = layout[side];
            const start = layout.center + (side === "left" ? -38 : 38);
            return <path key={side} ref={node => { physics.arms.current[side === "left" ? 0 : 1] = node; }} d={`M ${start} 120 Q ${p.x} 125 ${p.x} ${p.y - 12}`} />;
          })}
        </svg>
        <Glove elementRef={node => { physics.gloves.current[0] = node; }} />
        <Glove elementRef={node => { physics.gloves.current[1] = node; }} />
      </div>
      <div className="typing-board" role="group" aria-label={ru ? "Клавиатура технологий" : "Technology keyboard"}>
        {technologies.map((technology, index) => <button key={technology} ref={node => { keys.current[index] = node; }} type="button"
          className={`typing-key typing-key-${index}${selected === index ? " is-selected" : ""}${selected === index && pressed ? " is-down" : ""}`}
          aria-pressed={selected === index} onClick={() => { setPaused(true); setSelected(index); setPressed(false); }}>
          {icons[index] ? <span className="typing-key-logo" aria-hidden="true" style={{ maskImage: `url(/icons/stack/${icons[index]}.svg)`, WebkitMaskImage: `url(/icons/stack/${icons[index]}.svg)` }} /> : <span className="typing-key-symbol" aria-hidden="true">{"{ }"}</span>}<span>{technology}</span>
        </button>)}
      </div>
    </div>
    <div className="typing-caption"><span>{ru ? "В работе" : "On the keys"}: <strong>{technologies[selected]}</strong></span><span>{ru ? "Нажми на клавишу или потяни Микки" : "Try a key or drag Mickey"}</span></div>
  </div>;
}
