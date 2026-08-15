import { useEffect, useRef } from "react";
import CardBack from "./CardBack";
import CardEdges from "./CardEdges";
import CardFront from "./CardFront";

function Card() {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotationYRef = useRef(0);
  const rotationXRef = useRef(-8);
  const isDraggingRef = useRef(false);
  const lastPointerYRef = useRef(0);
  const lastPointerXRef = useRef(0);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = event.clientX;
    lastPointerYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const movementX = event.clientX - lastPointerXRef.current;
    const movementY = event.clientY - lastPointerYRef.current;
    const cardBounds = event.currentTarget.getBoundingClientRect();
    const shineX = ((event.clientX - cardBounds.left) / cardBounds.width) * 100;
    const shineY = ((event.clientY - cardBounds.top) / cardBounds.height) * 100;

    rotationYRef.current += movementX * 0.6;
    rotationXRef.current -= movementY * 0.4;

    rotationXRef.current = Math.max(-30, Math.min(30, rotationXRef.current));

    event.currentTarget.style.setProperty("--shine-x", `${shineX}%`);
    event.currentTarget.style.setProperty("--shine-y", `${shineY}%`);

    lastPointerXRef.current = event.clientX;
    lastPointerYRef.current = event.clientY;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    let animationFrameId: number;
    let previousTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - previousTime;
      previousTime = currentTime;

      if (!isDraggingRef.current) {
        rotationYRef.current += deltaTime * 0.02;
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
        onPointerCancel={handlePointerUp}
      >
        <CardFront />
        <CardBack />
        <CardEdges />
      </div>
    </section>
  );
}

export default Card;
