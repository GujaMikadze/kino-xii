import { useEffect, useRef, useState } from "react";

export function useCountdown(expiresAt: string | null, onExpire: () => void) {
  const [left, setLeft] = useState<number | null>(null);
  const expireRef = useRef(onExpire);

  useEffect(() => {
    expireRef.current = onExpire;
  });

  useEffect(() => {
    if (!expiresAt) {
      setLeft(null);
      return;
    }
    const end = new Date(expiresAt).getTime();

    const tick = () => {
      const s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(id);
        expireRef.current();
      }
    };

    const id = setInterval(tick, 250);
    tick();
    return () => clearInterval(id);
  }, [expiresAt]);

  return left;
}