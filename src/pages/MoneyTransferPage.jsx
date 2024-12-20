// pages/MoneyTransferPage.jsx
import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const MoneyTransferPage = () => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [characters, setCharacters] = useState([]);
  const [currentCash, setCurrentCash] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get user data to get cash amount
        const userDoc = await getDoc(doc(db, "user", user.uid));
        const userData = userDoc.data();
  
        // Fetch current user's cash
        const characterSnapshot = await getDoc(
          doc(db, "character", userData.character_id)
        );
        setCurrentCash(Number(characterSnapshot.data().cash));
  
        // Fetch all characters and filter out specific IDs
        const charactersSnapshot = await getDocs(collection(db, "character"));
        const charactersData = charactersSnapshot.docs
          .filter((doc) => 
            ![
              "d2wv9hw2m3wHsih4XmOK19", 
              "d2wv9hw2m3wHsih4XmOK20", 
              "d2wv9hw2m3wHsih4XmOK21"
            ].includes(doc.id)
          )
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        setCharacters(charactersData);
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
      // Update sender's cash
      const senderRef = doc(db, "character", userData.character_id);
      await updateDoc(senderRef, {
        cash: currentCash - transferAmount,
      });

      // Update recipient's cash
      const recipientDoc = await getDoc(doc(db, "character", recipient));
      const recipientCash = recipientDoc.data().cash;
      await updateDoc(doc(db, "character", recipient), {
        cash: recipientCash + transferAmount,
      });

      setCurrentCash(currentCash - transferAmount);
      setSuccess("Transfer successful!");
      setAmount("");
      setRecipient("");
    } catch (error) {
      setError("Transfer failed. Please try again.");
      console.error("Transfer error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Money Transfer</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <p className="text-lg text-green-600 font-bold">Current Balance: ${currentCash}</p>
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
            <label className="block text-gray-700 mb-2">Recipient</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select recipient</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.first_name} {char.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Amount ($)</label>
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
            Transfer Money
          </button>
        </form>
      </div>
    </div>
  );
};

export default MoneyTransferPage;
