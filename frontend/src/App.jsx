import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import PresentationEdit from './pages/PresentationEdit';
import PresentationPreview from './pages/PresentationPreview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        {/* <Route path="/:presentationId/edit" element={<PresentationEdit />} /> */}
        <Route path="/:presentationId/edit/slide/:slideIndex" element={<PresentationEdit />} />
        <Route path="/preview/:presentationId/slide/:slideIndex" element={<PresentationPreview />} />

      </Routes>
    </Router>
  );
}

export default App;
