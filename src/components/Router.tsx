import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Auth from "routes/Auth";
import Home from "routes/Home";
import Profile from "routes/Profile";
import Navigation from "components/Navigation";
import { UserObj } from "types";

interface AppRouterProps {
  refreshUser: () => void;
  isLoggedIn: boolean;
  userObj: UserObj | null;
}

const AppRouter = ({ refreshUser, isLoggedIn, userObj }: AppRouterProps) => {
  return (
    <Router>
      {isLoggedIn && <Navigation userObj={userObj} />}
      <div className="flex justify-center min-h-screen">
        <Routes>
          {isLoggedIn ? (
            <>
              <Route path="/" element={<Home userObj={userObj!} />} />
              <Route
                path="/profile"
                element={
                  <Profile userObj={userObj!} refreshUser={refreshUser} />
                }
              />
            </>
          ) : (
            <Route path="/" element={<Auth />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRouter;
