import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";

type Point = { x: number; y: number };
type Layout = { center: number; left: Point; right: Point; hand: "left" | "right" };
const sides = ["left", "right"] as const;
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
const ease = (t: number) => { const p = Math.max(0, Math.min(1, t)); return p * p * p * (p * (p * 6 - 15) + 10); };
const hover = 18;

export function useMickeyPhysics({ enabled, reduced, layout, keys, selected, onPress, onNext }: {
  enabled: boolean; reduced: boolean; layout: Layout;
  keys: RefObject<(HTMLButtonElement | null)[]>; selected: number;
  onPress: (pressed: boolean) => void; onNext: () => void;
}) {
  const character = useRef<HTMLButtonElement>(null);
  const arms = useRef<(SVGPathElement | null)[]>([]);
  const gloves = useRef<(HTMLDivElement | null)[]>([]);
  const hands = useRef([{ x: 0, y: 0, angle: -8 }, { x: 0, y: 0, angle: 8 }]);
  const cycle = useRef({ elapsed: 0, duration: .5, from: hands.current.map(p => ({ ...p })), done: false });
  const handsReady = useRef(false);
  const [dragging, setDragging] = useState(false);
  const body = useRef({ x: 0, y: 0, angle: 0, vx: 0, vy: 0, spin: 0 });
  const drag = useRef<{ id: number; x: number; y: number; originX: number; originY: number; time: number } | null>(null);
  const current = useRef({ enabled, layout, selected, onPress, onNext });
  const contact = useRef(false);
  const dragged = useRef(false);
  const gloveHeight = useRef(61);

  const setContact = (value: boolean) => {
    if (contact.current === value) return;
    contact.current = value;
    current.current.onPress(value);
  };

  const paint = () => {
    const b = body.current;
    if (character.current) character.current.style.transform = `translateX(-50%) translate(${b.x.toFixed(2)}px,${b.y.toFixed(2)}px) rotate(${b.angle.toFixed(2)}deg)`;
    const radians = b.angle * Math.PI / 180;
    const positions = current.current.layout;
    for (const [index, side] of sides.entries()) {
      const sign = side === "left" ? -1 : 1;
      const shoulder = sign * 38;
      const x = positions.center + b.x + shoulder * Math.cos(radians) + 4 * Math.sin(radians);
      const y = 124 + b.y + shoulder * Math.sin(radians) - 4 * Math.cos(radians);
      const hand = hands.current[index];
      const glove = gloves.current[index];
      if (glove) glove.style.transform = `translate3d(${hand.x}px,${hand.y}px,0) translate(-50%,-94%) rotate(${hand.angle}deg)`;

      // The sleeve ends at the rotated cuff; the fingertip stays anchored to the key.
      const wristAngle = hand.angle * Math.PI / 180;
      const cuffOffset = gloveHeight.current * .77;
      const cuffX = hand.x + Math.sin(wristAngle) * cuffOffset;
      const cuffY = hand.y - Math.cos(wristAngle) * cuffOffset;
      const reach = Math.hypot(cuffX - x, cuffY - y);
      const elbowX = x + (cuffX - x) * .48 + sign * Math.min(42, reach * .16);
      const elbowY = y + (cuffY - y) * .56 + Math.min(18, reach * .08);
      const forearm = Math.min(48, reach * .2);
      const tangentX = (cuffX - x) * .16;
      const tangentY = (cuffY - y) * .16;
      arms.current[index]?.setAttribute("d", `M ${x} ${y} C ${x + sign * 24} ${y + 20} ${elbowX - tangentX} ${elbowY - tangentY} ${elbowX} ${elbowY} C ${elbowX + tangentX} ${elbowY + tangentY} ${cuffX + Math.sin(wristAngle) * forearm} ${cuffY - Math.cos(wristAngle) * forearm} ${cuffX} ${cuffY}`);
    }
  };

  useEffect(() => {
    current.current = { enabled, layout, selected, onPress, onNext };
  }, [enabled, layout, selected, onPress, onNext]);

  useEffect(() => {
    if (!layout.center) return;
    keys.current.forEach(key => key?.style.removeProperty("--press-depth"));
    gloveHeight.current = gloves.current[0]?.offsetHeight || 61;
    if (!handsReady.current || !enabled || reduced) {
      hands.current = sides.map((side, index) => ({ ...layout[side], y: layout[side].y - hover, angle: index ? 8 : -8 }));
      handsReady.current = true;
    }
    const active = hands.current[layout.hand === "left" ? 0 : 1];
    const target = layout[layout.hand];
    cycle.current = {
      elapsed: 0, done: false, from: hands.current.map(p => ({ ...p })),
      duration: Math.min(.7, .36 + Math.hypot(target.x - active.x, target.y - hover - active.y) * .00065),
    };
    setContact(false);
    paint();
  }, [layout, reduced]);

  useEffect(() => {
    if (!enabled) {
      const pointer = drag.current;
      drag.current = null;
      if (pointer && character.current?.hasPointerCapture(pointer.id)) character.current.releasePointerCapture(pointer.id);
      setDragging(false);
      setContact(false);
      if (reduced) {
        keys.current.forEach(key => key?.style.removeProperty("--press-depth"));
        body.current = { x: 0, y: 0, angle: 0, vx: 0, vy: 0, spin: 0 };
        paint();
      }
      return;
    }
    let frame = 0;
    let previous = 0;
    const tick = (time: number) => {
      const delta = previous ? Math.min((time - previous) / 1000, .04) : 0;
      previous = time;
      const b = body.current;
      const state = current.current;
      const motion = cycle.current;
      if (!drag.current && handsReady.current && !motion.done) {
        motion.elapsed += delta;
        const activeIndex = state.layout.hand === "left" ? 0 : 1;
        const phase = motion.elapsed - motion.duration;
        let depth = 0;
        let lift = hover;
        if (phase >= 0 && phase < .12) lift = hover * (1 - ease(phase / .12));
        else if (phase >= .12 && phase < .20) { lift = 0; depth = ease((phase - .12) / .08); }
        else if (phase >= .20 && phase < .27) { lift = 0; depth = 1; }
        else if (phase >= .27 && phase < .36) { lift = 0; depth = 1 - ease((phase - .27) / .09); }
        else if (phase >= .36 && phase < .56) lift = hover * ease((phase - .36) / .20);

        for (const [index, side] of sides.entries()) {
          const hand = hands.current[index];
          const from = motion.from[index];
          const target = state.layout[side];
          const t = Math.min(1, motion.elapsed / motion.duration);
          const progress = ease(t);
          const distance = Math.hypot(target.x - from.x, target.y - hover - from.y);
          const arc = Math.min(46, distance * .16) * Math.sin(Math.PI * t) ** 2;
          const previousX = hand.x;
          hand.x = from.x + (target.x - from.x) * progress;
          hand.y = phase < 0
            ? from.y + (target.y - hover - from.y) * progress - arc
            : target.y - (index === activeIndex ? lift : hover) + (index === activeIndex ? depth * 5 : 0);
          const velocity = delta ? (hand.x - previousX) / delta : 0;
          const restAngle = index ? 8 : -8;
          const desiredAngle = restAngle + clamp(velocity * -.025, 13);
          hand.angle += (desiredAngle - hand.angle) * (1 - Math.exp(-16 * delta));
        }

        // Key travel and fingertip compression share the same clock, including release.
        keys.current[state.selected]?.style.setProperty("--press-depth", depth.toFixed(4));
        const touching = phase >= .12 && phase < .36;
        if (touching && !contact.current) {
          const direction = activeIndex ? 1 : -1;
          b.vy += 18; b.spin += direction * 9;
        }
        setContact(touching);

        let remaining = delta;
        const lean = clamp((state.layout[state.layout.hand].x - state.layout.center) * .11, 38);
        while (remaining > 0) {
          const dt = Math.min(remaining, 1 / 120);
          b.vx += (100 * (lean - b.x) - 19 * b.vx) * dt;
          b.vy += (-190 * b.y - 22 * b.vy) * dt;
          b.spin += (110 * (lean * .08 - b.angle) - 18 * b.spin) * dt;
          b.x += b.vx * dt; b.y += b.vy * dt; b.angle += b.spin * dt;
          b.x = clamp(b.x, 58); b.y = Math.max(-7, Math.min(26, b.y)); b.angle = clamp(b.angle, 12);
          remaining -= dt;
        }
        paint();
        if (phase > .7 + state.selected % 3 * .055) {
          motion.done = true;
          keys.current[state.selected]?.style.removeProperty("--press-depth");
          state.onNext();
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, reduced]);

  const finish = (event: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    if (drag.current?.id !== event.pointerId) return;
    if (cancelled || performance.now() - drag.current.time > 100) {
      body.current.vx = 0; body.current.vy = 0; body.current.spin = 0;
    }
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return { character, arms, gloves, dragging, handlers: {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (!current.current.enabled || event.button !== 0 || drag.current) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: body.current.x, originY: body.current.y, time: performance.now() };
      dragged.current = false;
      setDragging(true);
      setContact(false);
    },
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
      const pointer = drag.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      const b = body.current;
      const now = performance.now();
      const dt = Math.max((now - pointer.time) / 1000, .008);
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      const x = clamp(pointer.originX + dx, 52);
      const y = Math.max(-6, Math.min(24, pointer.originY + dy));
      b.vx = clamp((x - b.x) / dt, 240);
      b.vy = clamp((y - b.y) / dt, 150);
      const angle = x * .22;
      b.spin = clamp((angle - b.angle) / dt, 100);
      b.x = x; b.y = y; b.angle = angle;
      pointer.time = now;
      dragged.current ||= Math.hypot(dx, dy) > 4;
      paint();
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => finish(event),
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => finish(event, true),
    onLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => finish(event, true),
    onClick: () => {
      if (!current.current.enabled || dragged.current) { dragged.current = false; return; }
      body.current.vx += 85; body.current.vy -= 45; body.current.spin += 80;
    },
  } };
}
