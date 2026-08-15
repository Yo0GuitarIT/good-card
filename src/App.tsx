import "./App.css";
import { useEffect, useRef } from "react";
function App() {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const movementX = event.clientX - lastPointerXRef.current;
    rotationRef.current += movementX * 0.6;
    lastPointerXRef.current = event.clientX;
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
        rotationRef.current += deltaTime * 0.02;
      }

      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(-8deg) rotateY(${rotationRef.current}deg)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <main className="App">
      <section className="scene" aria-label="3D card">
        <div
          className="card"
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <article className="card-face card-front">
            <span className="card-label">FOR YOU</span>
            <h1>Good Card</h1>
            <p>A little card made just for you!</p>
          </article>

          <article className="card-face card-back">
            <span className="card-heart" aria-hidden="true">
              ♥
            </span>
            <p>Thank you for being here.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
