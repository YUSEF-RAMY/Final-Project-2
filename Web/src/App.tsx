import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OnboardingPage from "./pages/OnboardingPage";
import OnboardingStepPage from "./pages/OnboardingSteps";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AnalysisInBodyPage from './pages/AnalysisInBody';
import TargetPage from './pages/TargetPage';
import Home from './pages/Home';
import FoodLogPage from './pages/FoodLogPage';

import { NotificationProvider } from './context/NotificationContext';
import Splash from './components/Splash/Splash';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Splash />} />

          <Route path="/login" element={<div className="login-wrapper"><Login /></div>} />

          <Route path="/signup" element={<div className="signup-wrapper"><SignUp /></div>} />

          <Route path="/onboarding1" element={<div className="onboarding-wrapper"><OnboardingPage /></div>} />

          <Route path="/onboarding2" element={<OnboardingStepPage />} />

          <Route path="/forget-password" element={<ForgotPasswordPage />} />

          <Route path="/analysis-inbody" element={<AnalysisInBodyPage />} />

          <Route path="/target" element={<TargetPage />} />
          
          <Route path="/dashboard" element={<Home />} />

          <Route path="/food-log" element={<FoodLogPage />} />

        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;