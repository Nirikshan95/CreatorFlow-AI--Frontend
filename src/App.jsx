import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import History from './pages/History';
import ContentDetailPage from './pages/ContentDetailPage';
import ChannelProfiles from './pages/ChannelProfiles';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Top navbar — spans full width */}
        <div className="app-navbar">
          <Navbar />
        </div>

        {/* Left sidebar */}
        <div className="app-sidebar">
          <Sidebar />
        </div>

        {/* Main content area */}
        <main className="app-main">
          <Routes>
            <Route path="/"             element={<Dashboard />}        />
            <Route path="/generate"     element={<Generate />}         />
            <Route path="/channel-profiles" element={<ChannelProfiles />} />
            <Route path="/history"      element={<History />}          />
            <Route path="/content/:id"  element={<ContentDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
