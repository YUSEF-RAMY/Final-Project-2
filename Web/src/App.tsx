import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import OnboardingPage from "./pages/OnboardingPage/OnboardingPage";
import OnboardingStepPage from "./pages/OnboardingSteps/OnboardingSteps";
import ForgotPasswordPage from "./pages/ForgetPasswordPage/ForgotPasswordPage";
import AnalysisInBodyPage from './pages/AnalysisInBody/AnalysisInBody';
import TargetPage from './pages/TargetPage/TargetPage';
import Home from './pages/Home/Home';
import FoodLogPage from './pages/FoodLogPage/FoodLogPage';
import ProfilePage from './pages/Profile/Profile';

import { NotificationProvider } from './context/NotificationContext';
import GlobalNotification from './components/GlobalNotification/GlobalNotification';
import Splash from './components/Splash/Splash';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <GlobalNotification />
        <Routes>
          <Route path="/" element={<Splash />} />

          <Route path="/login" element={<div className="login-wrapper"><Login /></div>} />

          <Route path="/signup" element={<div className="signup-wrapper"><SignUp /></div>} />

          <Route path="/onboarding1" element={<div className="onboarding-wrapper"><OnboardingPage /></div>} />

          <Route path="/onboarding2" element={<OnboardingStepPage />} />

          {/* Alias — used by "Update Body Data" button in Profile */}
          <Route path="/onboardingsteps" element={<OnboardingStepPage />} />

          <Route path="/forget-password" element={<ForgotPasswordPage />} />

          <Route path="/analysis-inbody" element={<AnalysisInBodyPage />} />

          <Route path="/target" element={<TargetPage />} />

          <Route path="/dashboard" element={<Home />} />

          <Route path="/food-log" element={<FoodLogPage />} />

          <Route path="/profile" element={<ProfilePage />} />

        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;