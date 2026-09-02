import { useState } from "react";
import "./App.css";
import "./admin.css";
import AdminPage from "./pages/AdminPage";
import ViewerPage from "./pages/ViewerPage";
import { isAdminPath } from "./routes";

function App() {
  // 只有兩條路徑，開啟後不會在頁面之間切換，所以不需要引入路由套件。
  const [showAdmin] = useState(() => isAdminPath(window.location.pathname));

  return showAdmin ? <AdminPage /> : <ViewerPage />;
}

export default App;
