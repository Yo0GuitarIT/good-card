import { useEffect, useRef, useState } from "react";
import type { CardData } from "../types/card";
import CardBack from "./CardBack";
import CardEdges from "./CardEdges";
import CardFront from "./CardFront";

type CardProps = {
  data: CardData;
};

const gestureHintStorageKey = "good-card:gesture-hint-seen";

function Card({ data }: CardProps) {
  const [showGestureHint, setShowGestureHint] = useState(() => {
    try {
      return localStorage.getItem(gestureHintStorageKey) !== "true";
    } catch {
      return true;
    }
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const rotationYRef = useRef(0);
  const rotationXRef = useRef(-8);
  const isDraggingRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const velocityXRef = useRef(0);
  const velocityYRef = useRef(0);
  const flipAnimationRef = useRef<{
    from: number;
    to: number;
    startedAt: number;
  } | null>(null);

  const startFlip = () => {
    velocityXRef.current = 0;
    velocityYRef.current = 0;
    flipAnimationRef.current = {
      from: rotationYRef.current,
      to: rotationYRef.current + 180,
      startedAt: performance.now(),
    };
  };

  const dismissGestureHint = () => {
    if (!showGestureHint) return;

    setShowGestureHint(false);

    try {
      localStorage.setItem(gestureHintStorageKey, "true");
    } catch {
      // The hint can still disappear for this session when storage is unavailable.
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    hasInteractedRef.current = true;
    hasDraggedRef.current = false;
    flipAnimationRef.current = null;
    pointerStartXRef.current = event.clientX;
    pointerStartYRef.current = event.clientY;
    lastPointerXRef.current = event.clientX;
    lastPointerYRef.current = event.clientY;
    lastPointerTimeRef.current = performance.now();
    velocityXRef.current = 0;
    velocityYRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const draggedDistance = Math.hypot(
      event.clientX - pointerStartXRef.current,
      event.clientY - pointerStartYRef.current,
    );

    if (draggedDistance < 6) return;

    if (!hasDraggedRef.current) {
      hasDraggedRef.current = true;
      dismissGestureHint();
    }

    const movementX = event.clientX - lastPointerXRef.current;
    const movementY = event.clientY - lastPointerYRef.current;
    const currentTime = performance.now();
    const elapsedTime = Math.max(currentTime - lastPointerTimeRef.current, 1);
    const cardBounds = event.currentTarget.getBoundingClientRect();
    const shineX = ((event.clientX - cardBounds.left) / cardBounds.width) * 100;
    const shineY = ((event.clientY - cardBounds.top) / cardBounds.height) * 100;

    const rotationDeltaY = movementX * 0.6;
    const rotationDeltaX = -movementY * 0.4;

    rotationYRef.current += rotationDeltaY;
    rotationXRef.current += rotationDeltaX;

    velocityYRef.current =
      velocityYRef.current * 0.65 + (rotationDeltaY / elapsedTime) * 0.35;
    velocityXRef.current =
      velocityXRef.current * 0.65 + (rotationDeltaX / elapsedTime) * 0.35;

    rotationXRef.current = Math.max(-30, Math.min(30, rotationXRef.current));

    event.currentTarget.style.setProperty("--shine-x", `${shineX}%`);
    event.currentTarget.style.setProperty("--shine-y", `${shineY}%`);

    lastPointerXRef.current = event.clientX;
    lastPointerYRef.current = event.clientY;
    lastPointerTimeRef.current = currentTime;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!hasDraggedRef.current) {
      startFlip();
    } else if (performance.now() - lastPointerTimeRef.current > 80) {
      velocityXRef.current = 0;
      velocityYRef.current = 0;
    }
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    hasInteractedRef.current = true;
    startFlip();
  };

  useEffect(() => {
    let animationFrameId: number;
    const introStartedAt = performance.now();
    let previousFrameTime = introStartedAt;
    const introDuration = 1800;
    const flipDuration = 650;

    const animate = (currentTime: number) => {
      const frameTime = Math.min(currentTime - previousFrameTime, 32);
      previousFrameTime = currentTime;
      const flipAnimation = flipAnimationRef.current;

      if (!isDraggingRef.current && flipAnimation) {
        const flipProgress = Math.min(
          (currentTime - flipAnimation.startedAt) / flipDuration,
          1,
        );
        const easedProgress = 1 - Math.pow(1 - flipProgress, 3);

        rotationYRef.current =
          flipAnimation.from +
          (flipAnimation.to - flipAnimation.from) * easedProgress;

        if (flipProgress === 1) {
          flipAnimationRef.current = null;
        }
      } else if (!isDraggingRef.current && !hasInteractedRef.current) {
        const introProgress = Math.min(
          (currentTime - introStartedAt) / introDuration,
          1,
        );
        const easedProgress = 1 - Math.pow(1 - introProgress, 3);

        rotationYRef.current = easedProgress * 360;
        rotationXRef.current = -14 + easedProgress * 6;
      } else if (!isDraggingRef.current) {
        rotationYRef.current += velocityYRef.current * frameTime;
        rotationXRef.current += velocityXRef.current * frameTime;

        const friction = Math.pow(0.92, frameTime / 16.67);
        velocityYRef.current *= friction;
        velocityXRef.current *= friction;

        if (Math.abs(velocityYRef.current) < 0.002) {
          velocityYRef.current = 0;
        }

        if (rotationXRef.current <= -30 || rotationXRef.current >= 30) {
          rotationXRef.current = Math.max(
            -30,
            Math.min(30, rotationXRef.current),
          );
          velocityXRef.current = 0;
        } else if (Math.abs(velocityXRef.current) < 0.002) {
          velocityXRef.current = 0;
        }
      }

      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${rotationXRef.current}deg) rotateY(${rotationYRef.current}deg)`;

        if (!isDraggingRef.current) {
          const rotationInRadians = (rotationYRef.current * Math.PI) / 180;
          const shineX = 50 + Math.sin(rotationInRadians) * 35;
          const shineY = 50 + (rotationXRef.current / 30) * 25;

          cardRef.current.style.setProperty("--shine-x", `${shineX}%`);
          cardRef.current.style.setProperty("--shine-y", `${shineY}%`);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <section className="scene" aria-label="3D card">
      <div
        className="card"
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="カードを裏返す"
      >
        <CardFront data={data} />
        <CardBack data={data} />
        <CardEdges />
      </div>
      <p
        className={`gesture-hint ${showGestureHint ? "gesture-hint-visible" : ""}`}
        aria-hidden={!showGestureHint}
      >
        左右にスワイプして裏面を見る
      </p>
    </section>
  );
}

export default Card;
