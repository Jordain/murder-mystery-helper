import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const PokerPage = () => {
  const [amount, setAmount] = useState("");
  const [currentCash, setCurrentCash] = useState(0);
  const [potAmount, setPotAmount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user's cash
        const userDoc = await getDoc(doc(db, "user", user.uid));
        const userData = userDoc.data();

        // Fetch current user's cash
        const characterSnapshot = await getDoc(
          doc(db, "character", userData.character_id)
        );
        setCurrentCash(characterSnapshot.data().cash);

        // Fetch current pot amount from 'character' collection (user's character)
        const characterDoc = await getDoc(
          doc(db, "character", "t1V3x7zfJIyXZjakIAZV")
        );
        setPotAmount(characterDoc.data().cash || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const transferAmount = Number(amount);
    if (transferAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (transferAmount > currentCash) {
      setError("Insufficient funds");
      return;
    }

    try {
      // First get user data to get cash amount
      const userDoc = await getDoc(doc(db, "user", user.uid));
      const userData = userDoc.data();
      // Update user's cash
      const userRef = doc(db, "character", userData.character_id);
      await updateDoc(userRef, {
        cash: currentCash - transferAmount,
      });

      // Update character's pot amount
      const characterRef = doc(db, "character", "t1V3x7zfJIyXZjakIAZV"); // Assuming character ID matches user ID
      await updateDoc(characterRef, {
        cash: potAmount + transferAmount,
      });

      setCurrentCash(currentCash - transferAmount);
      setPotAmount(potAmount + transferAmount);
      setSuccess("Transfer to pot successful!");
      setAmount("");
    } catch (error) {
      setError("Transfer failed. Please try again.");
      console.error("Transfer error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Poker Pot</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6 space-y-2">
          <p className="text-lg text-green-600 font-bold">
            Current Balance: ${currentCash}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 shadow-inner rounded-lg p-4 mb-6">
          <p className="text-3xl text-blue-600 font-bold text-center">
            Current Pot: ${potAmount}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Amount to Transfer ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Transfer to Pot
          </button>
        </form>
      </div>
    </div>
  );
};

export default PokerPage;
