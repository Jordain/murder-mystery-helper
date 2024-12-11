import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const HintPage = () => {
  const [hints, setHints] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [loading, setLoading] = useState(true);
  const [characterData, setCharacterData] = useState(null);
  const [characterId, setCharacterId] = useState(null); // Added state for characterId
  const { user } = useAuth();

  const fetchHints = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get user data to fetch character ID
      const userDoc = await getDoc(doc(db, "user", user.uid));
      const userData = userDoc.data();
      const fetchedCharacterId = userData.character_id;
      setCharacterId(fetchedCharacterId);

      // Get character data
      const characterRef = await getDoc(
        doc(db, "character", fetchedCharacterId)
      );
      const fetchedCharacterData = characterRef.data();
      setCharacterData(fetchedCharacterData);

      // Fetch current round from admin collection
      const adminQuery = query(collection(db, "admin"));
      const adminSnapshot = await getDocs(adminQuery);
      const adminData = adminSnapshot.docs[0]?.data();
      const round = adminData?.round || 0;
      setCurrentRound(round);

      // Fetch all hints for the current round and character
      const hintQuery = query(collection(db, "hint"));
      const hintSnapshot = await getDocs(hintQuery);

      const filteredHints = hintSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((hint) => {
          // Include hints without a character_id
          if (!hint.character_id) return true;

          // Only include hints where the character_id matches the logged-in character
          return hint.character_id === fetchedCharacterId;
        })
        .filter((hint) => hint.round <= round); // Ensure the hint is for the current or earlier round

      setHints(filteredHints);
    } catch (error) {
      console.error("Error fetching hints: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHints();
  }, [user]);

  const updateUserCash = async (amount) => {
    if (!characterData || !characterId) return;

    try {
      const characterRef = doc(db, "character", characterId);
      await updateDoc(characterRef, {
        cash: Math.max(0, characterData.cash - amount),
      });

      setCharacterData((prev) => ({
        ...prev,
        cash: Math.max(0, prev.cash - amount),
      }));
    } catch (error) {
      console.error("Error updating user cash: ", error);
      alert("Failed to update cash.");
    }
  };

  const buyHint = async (hintId) => {
    if (!user || !characterId) {
      alert("Please log in to buy a hint.");
      return;
    }

    try {
      const hint = hints.find((h) => h.id === hintId);
      if (!hint) {
        alert("Hint not found.");
        return;
      }

      const { cost, bought = [] } = hint;

      if (characterData.cash < cost) {
        alert("Not enough cash to buy this hint.");
        return;
      }

      if (bought.some((buyer) => buyer.character_id === characterId)) {
        alert("You have already bought this hint.");
        return;
      }

      const newBoughtEntry = {
        character_id: characterId,
        locked: false,
        createdAt: Timestamp.now(),
      };

      const hintRef = doc(db, "hint", hintId);
      await updateDoc(hintRef, {
        bought: [...bought, newBoughtEntry],
      });

      await updateUserCash(cost);

      alert(`Hint "${hint.hint}" purchased successfully!`);
      fetchHints();
    } catch (error) {
      console.error("Error buying hint: ", error);
      alert("Failed to buy hint.");
    }
  };

  const buyRandomHint = async () => {
    if (!user || !characterId) {
      alert("Please log in to buy a hint.");
      return;
    }

    try {
      const availableHints = hints.filter(
        (hint) =>
          !hint.bought?.some((buyer) => buyer.character_id === characterId)
      );

      if (availableHints.length === 0) {
        alert("No available hints to purchase.");
        return;
      }

      const randomHint =
        availableHints[Math.floor(Math.random() * availableHints.length)];

      if (characterData.cash < randomHint.cost) {
        alert("Not enough cash to buy a random hint.");
        return;
      }

      await buyHint(randomHint.id);
    } catch (error) {
      console.error("Error buying random hint: ", error);
      alert("Failed to buy random hint.");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 p-4">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Hints</h1>

      <div className="text-center mb-6 text-xl font-semibold">
        Current Cash:{" "}
        <span className="text-green-600">${characterData?.cash || 0}</span>
      </div>

      <div className="space-y-6">
        {hints.length > 0 ? (
          hints.map((hint) => {
            const isPurchased = hint.bought?.some(
              (buyer) => buyer.character_id === characterId && !buyer.locked
            );

            return (
              <div
                key={hint.id}
                className={`border rounded-lg p-4 ${
                  isPurchased
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  {/* Display hint.title or hint.hint based on purchase status */}
                  <p className="text-gray-800">
                    {isPurchased ? hint.hint : hint.title}
                  </p>
                  <div className="flex items-center space-x-4">
                    {!isPurchased && (
                      <>
                        <span className="text-gray-600 font-semibold">
                          Cost: ${hint.cost}
                        </span>
                        <button
                          onClick={() => buyHint(hint.id)}
                          disabled={(characterData?.cash || 0) < hint.cost}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            (characterData?.cash || 0) < hint.cost
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          Buy Hint
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-600">
            No hints available for this round.
          </div>
        )}
      </div>
    </div>
  );
};

export default HintPage;
