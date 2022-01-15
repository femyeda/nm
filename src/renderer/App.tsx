import React from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import './App.css';
import LoginScreen from './screens/LoginScreen';

declare global {
  interface Window {
    electron: {
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
      };
      ipcRenderer: {
        on: any;
        once: any;
        send: any;
        myPing: any;
      };
    };
  }
}

const Hello = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const loggedIn = window.electron.store.get('access_token');

    if (!loggedIn) {
      navigate('/login');
    }
  }, []);

  return (
    <>
      <div className="hello">
        <p className="title">iMessage clone for GMail.</p>
      </div>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </Router>
  );
}
