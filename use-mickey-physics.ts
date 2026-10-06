import { useEffect, useRef, useState, type PointerEvent } from "react";

type Point = { x: number; y: number };
type Layout = { center: number; left: Point; right: Point };
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

export function useMickeyPhysics({ enabled, reduced, pressed, layout }: {
  enabled: boolean; reduced: boolean; pressed: boolean; layout: Layout;
}) {
  const character = useRef<HTMLButtonElement>(null);
  const arms = useRef<(SVGPathElement | null)[]>([]);
  const gloves = useRef<(HTMLDivElement | null)[]>([]);
  const hands = useRef([ { x: 0, y: 0, vx: 0, vy: 0 }, { x: 0, y: 0, vx: 0, vy: 0 } ]);
  const handsReady = useRef(false);
  const [dragging, setDragging] = useState(false);
  const body = useRef({ x: 0, y: 0, angle: 0, vx: 0, vy: 0, spin: 0 });
  const drag = useRef<{ id: number; x: number; y: number; originX: number; originY: number; time: number } | null>(null);
  const current = useRef({ enabled, layout });
  const dragged = useRef(false);

  const paint = () => {
    const b = body.current;
    if (character.current) character.current.style.transform = `translateX(-50%) translate(${b.x.toFixed(2)}px,${b.y.toFixed(2)}px) rotate(${b.angle.toFixed(2)}deg)`;
    const radians = b.angle * Math.PI / 180;
    const positions = current.current.layout;
    for (const [index, side] of (["left", "right"] as const).entries()) {
      const shoulder = side === "left" ? -38 : 38;
      const x = positions.center + b.x + shoulder * Math.cos(radians) + 4 * Math.sin(radians);
      const y = 124 + b.y + shoulder * Math.sin(radians) - 4 * Math.cos(radians);
      const hand = hands.current[index];
      const glove = gloves.current[index];
      if (glove) { glove.style.left = `${hand.x}px`; glove.style.top = `${hand.y}px`; }
      arms.current[index]?.setAttribute("d", `M ${x} ${y} Q ${hand.x} ${125 + b.y * .4} ${hand.x} ${hand.y - 12}`);
    }
  };

  useEffect(() => {
    current.current = { enabled, layout };
    if (!handsReady.current || !enabled) {
      for (const [index, side] of (["left", "right"] as const).entries()) {
        hands.current[index] = { ...layout[side], vx: 0, vy: 0 };
      }
      handsReady.current = layout.center > 0;
    }
    paint();
  }, [enabled, layout]);

  useEffect(() => {
    if (enabled && pressed && !drag.current) {
      const direction = layout.left.y > 180 ? -1 : 1;
      body.current.vx += direction * 22;
      body.current.vy += 48;
      body.current.spin += direction * 38;
    }
  }, [enabled, pressed, layout]);

  useEffect(() => {
    if (!enabled) {
      const pointer = drag.current;
      drag.current = null;
      if (pointer && character.current?.hasPointerCapture(pointer.id)) character.current.releasePointerCapture(pointer.id);
      setDragging(false);
      if (reduced) {
        body.current = { x: 0, y: 0, angle: 0, vx: 0, vy: 0, spin: 0 };
        paint();
      }
      return;
    }
    let frame = 0;
    let previous = 0;
    const tick = (time: number) => {
      let remaining = previous ? Math.min((time - previous) / 1000, .032) : 0;
      previous = time;
      const b = body.current;
      if (!drag.current) {
        // Small integration steps keep the damped spring stable on slow frames.
        while (remaining > 0) {
          const dt = Math.min(remaining, 1 / 120);
          b.vx += (-170 * b.x - 17 * b.vx) * dt;
          b.vy += (-190 * b.y - 18 * b.vy) * dt;
          b.spin += (-145 * b.angle - 15 * b.spin) * dt;
          b.x += b.vx * dt; b.y += b.vy * dt; b.angle += b.spin * dt;
          if (Math.abs(b.x) > 46) { b.x = clamp(b.x, 46); b.vx *= -.25; }
          if (b.y < -7 || b.y > 26) { b.y = Math.max(-7, Math.min(26, b.y)); b.vy *= -.25; }
          if (Math.abs(b.angle) > 12) { b.angle = clamp(b.angle, 12); b.spin *= -.25; }
          for (const [index, side] of (["left", "right"] as const).entries()) {
            const hand = hands.current[index], target = current.current.layout[side];
            hand.vx += (240 * (target.x - hand.x) - 29 * hand.vx) * dt;
            hand.vy += (240 * (target.y - hand.y) - 29 * hand.vy) * dt;
            hand.x += hand.vx * dt; hand.y += hand.vy * dt;
          }
          remaining -= dt;
        }
        paint();
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
    },
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
      const pointer = drag.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      const b = body.current;
      const now = performance.now();
      const dt = Math.max((now - pointer.time) / 1000, .008);
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      const x = clamp(pointer.originX + dx, 42);
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
