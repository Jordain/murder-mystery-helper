import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, collection, query, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const AdminPanel = () => {
  const [currentRound, setCurrentRound] = useState(0);
  const [adminDocId, setAdminDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPermission, setUserPermission] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserDataAndCurrentRound = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "user", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (!userData) {
          console.error("User data not found");
          setLoading(false);
          return;
        }

        setUserPermission(userData.permission);

        if (userData.permission !== "admin") {
          setLoading(false);
          return;
        }

        const adminQuery = query(collection(db, "admin"));
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          const adminDoc = adminSnapshot.docs[0];
          setCurrentRound(adminDoc.data().round);
          setAdminDocId(adminDoc.id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndCurrentRound();
  }, [user]);

  const handleRoundUpdate = async (newRound) => {
    if (!adminDocId) return;

    try {
      const adminDocRef = doc(db, "admin", adminDocId);
      await updateDoc(adminDocRef, { round: newRound });
      setCurrentRound(newRound);
    } catch (error) {
      console.error("Error updating round:", error);
    }
  };

  if (!loading && (!user || userPermission !== "admin")) {
    return <Navigate to="/character" replace />;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Round</h2>
          <div className="border rounded-lg p-4 bg-gray-50 shadow-md">
            <label htmlFor="round-select" className="text-lg font-bold text-gray-700 mb-2">
              Select Round:
            </label>
            <select
              id="round-select"
              value={currentRound}
              onChange={(e) => handleRoundUpdate(Number(e.target.value))}
              className="mt-2 block w-full p-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {[0, 1, 2, 3].map((round) => (
                <option key={round} value={round}>
                  Round {round}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
          <div className="border rounded-lg p-4 bg-gray-50 shadow-md">
            <p className="text-gray-600">
              Use the controls above to manage the current round for all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
