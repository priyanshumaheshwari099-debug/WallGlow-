import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import PaintStudio from "./pages/PaintStudio/PaintStudio";
import AboutWallGlow from "./pages/About/About";

import UserDashboard from "./components/UserDashboard/UserDashboard";
import ProfileDetails from "./pages/ProfileDetails/ProfileDetails";
import Favorites from "./pages/Favorites/Favorites";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about-wall-glow" element={<AboutWallGlow />} />

        {/* FAVORITES PAGE */}
        <Route path="/favorites" element={<Favorites />} />

        {/* PAINT STUDIO */}
        <Route path="/paint-studio" element={<PaintStudio />} />

        {/* USER DASHBOARD */}
        <Route path="/dashboard" element={<UserDashboard />}>
          <Route path="paint-studio" element={<PaintStudio />} />
          <Route path="profile" element={<ProfileDetails />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="history" element={<div>Design History</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;