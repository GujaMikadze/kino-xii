import { useCallback, useRef } from "react";

const THRESHOLD = 5; // below this the gesture counts as a click
const FRICTION = 0.95; // velocity kept per 16.7ms frame
const MIN_VELOCITY = 0.05; // px/ms, below this momentum stops

export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const cleanup = useRef<(() => void) | null>(null);

  return useCallback((el: T | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!el) return;

    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0; // scroll px per ms
    let raf = 0;

    const stopMomentum = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const startMomentum = () => {
      let prev = performance.now();
      const step = (now: number) => {
        const dt = now - prev;
        prev = now;

        const before = el.scrollLeft;
        el.scrollLeft += velocity * dt;
        if (el.scrollLeft === before) velocity = 0; // hit an edge

        velocity *= Math.pow(FRICTION, dt / 16.67);
        raf = Math.abs(velocity) > MIN_VELOCITY ? requestAnimationFrame(step) : 0;
      };
      raf = requestAnimationFrame(step);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stopMomentum();
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      startScroll = el.scrollLeft;
      lastT = e.timeStamp;
      velocity = 0;
    };

    const end = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      el.classList.remove("dragging");
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);

      if (moved) {
        if (e.timeStamp - lastT > 100) velocity = 0; // held still before release
        if (Math.abs(velocity) > MIN_VELOCITY) startMomentum();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!down) return;
      if (e.buttons === 0) return end(e); // button released outside the window

      if (!moved) {
        if (Math.abs(e.clientX - startX) <= THRESHOLD) return;
        // restart the reference point here so the list doesn't jump by the threshold
        moved = true;
        startX = lastX = e.clientX;
        startScroll = el.scrollLeft;
        lastT = e.timeStamp;
        el.classList.add("dragging");
        el.setPointerCapture(e.pointerId);
        return;
      }

      el.scrollLeft = startScroll - (e.clientX - startX);

      const dt = e.timeStamp - lastT;
      if (dt > 0) {
        const v = -(e.clientX - lastX) / dt;
        velocity = velocity * 0.6 + v * 0.4; // smoothed
      }
      lastX = e.clientX;
      lastT = e.timeStamp;
    };

    // a drag must not trigger a click on the card underneath
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    const onDragStart = (e: DragEvent) => e.preventDefault();

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("wheel", stopMomentum, { passive: true });

    cleanup.current = () => {
      stopMomentum();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("wheel", stopMomentum);
    };
  }, []);
}