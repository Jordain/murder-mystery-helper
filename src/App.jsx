// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Components
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import CharacterPage from "./pages/CharacterPage.jsx";
import MoneyTransferPage from "./pages/MoneyTransferPage";
import MurdererPage from "./pages/MurdererPage";
import LayeredSecretPage from "./pages/LayeredSecretPage";
import CluePage from "./pages/CluePage.jsx";
import QRPage from "./pages/QRPage";
import PokerPage from "./pages/PokerPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import GuestListPage from "./pages/GuestListPage.jsx";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBIpqKUuaEPeKgKEgUWzNmvhZy8BSubpp8",

  authDomain: "murdermystery-dbf6d.firebaseapp.com",

  projectId: "murdermystery-dbf6d",

  storageBucket: "murdermystery-dbf6d.firebasestorage.app",

  messagingSenderId: "1003669424930",

  appId: "1:1003669424930:web:118bec54d4487907d3b37b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <NavBar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
            <Route path="/" element={<HomePage />} />
              <Route
                path="/guest"
                element={
                  <ProtectedRoute>
                    <GuestListPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<HomePage />} />
              <Route
                path="/character"
                element={
                  <ProtectedRoute>
                    <CharacterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transfer"
                element={
                  <ProtectedRoute>
                    <MoneyTransferPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/murderer"
                element={
                  <ProtectedRoute>
                    <MurdererPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/secrets"
                element={
                  <ProtectedRoute>
                    <LayeredSecretPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clues"
                element={
                  <ProtectedRoute>
                    <CluePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/qr"
                element={
                  <ProtectedRoute>
                    <QRPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/poker"
                element={
                  <ProtectedRoute>
                    <PokerPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
