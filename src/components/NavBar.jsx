import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../App";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserPermission = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "user", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().permission === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user permission:", error);
          setIsAdmin(false);
        }
      }
    };

    fetchUserPermission();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
    { to: "/guest", label: "Guest List" },
    { to: "/character", label: "Character" },
    { to: "/transfer", label: "Transfer" },
    { to: "/murderer", label: "Vote" },
    { to: "/secrets", label: "Secrets" },
    { to: "/clues", label: "Clues" },
    { to: "/qr", label: "QR" },
    { to: "/poker", label: "Poker" },
    { to: "https://www.hemloxx.com/", label: "Hemloxx" },
  ];

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Murder Mystery
          </Link>

          {/* Hamburger Menu Button */}
          {user && (
            <div className="md:hidden">
              <button onClick={toggleMenu} className="focus:outline-none">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-blue-200"
                >
                  {link.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="hover:text-blue-200">
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {user && isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-blue-600">
            <div className="flex flex-col space-y-2 px-4 pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-blue-200 py-2 border-b border-blue-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="hover:text-blue-200 text-left py-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
