import "./App.css";

function App() {
  return (
    <main className="App">
      <section className="scene" aria-label="3D card">
        <div className="card">
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
