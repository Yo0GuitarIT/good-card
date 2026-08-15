import "./App.css";
import Card from "./components/Card";
import { cardData } from "./data/cards";

function App() {
  return (
    <main className="App">
      <Card data={cardData} />
    </main>
  );
}

export default App;
