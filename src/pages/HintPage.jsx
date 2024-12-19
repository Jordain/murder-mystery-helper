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
  const [characterId, setCharacterId] = useState(null);
  const { user } = useAuth();

  const naturalSort = (a, b) => {
    const extractNumber = (str) => {
      const match = str.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    };
    return extractNumber(a) - extractNumber(b);
  };

  const categorizeHints = (hints) => {
    const categories = {
      recommended: [],
      qr: [],
      secret: [],
      rumor: [],
    };

    hints.forEach((hint) => {
      if (hint.title.toLowerCase().includes("recommended")) {
        categories.recommended.push(hint);
      } else if (hint.title.toLowerCase().includes("qr")) {
        categories.qr.push(hint);
      } else if (hint.title.toLowerCase().includes("secret")) {
        categories.secret.push(hint);
      } else {
        categories.rumor.push(hint);
      }
    });

    Object.keys(categories).forEach((category) => {
      categories[category].sort((a, b) => naturalSort(a.title, b.title));
    });

    return categories;
  };

  const fetchHints = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "user", user.uid));
      const userData = userDoc.data();
      const fetchedCharacterId = userData.character_id;
      setCharacterId(fetchedCharacterId);

      const characterRef = await getDoc(
        doc(db, "character", fetchedCharacterId)
      );
      const fetchedCharacterData = characterRef.data();
      setCharacterData(fetchedCharacterData);

      const adminQuery = query(collection(db, "admin"));
      const adminSnapshot = await getDocs(adminQuery);
      const adminData = adminSnapshot.docs[0]?.data();
      const round = adminData?.round || 0;
      setCurrentRound(round);

      const hintQuery = query(collection(db, "hint"));
      const hintSnapshot = await getDocs(hintQuery);

      const filteredHints = hintSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((hint) => {
          if (!hint.character_id) return true;
          return hint.character_id === fetchedCharacterId;
        })
        .filter((hint) => hint.round <= round);

      const categorizedHints = categorizeHints(filteredHints);
      setHints(categorizedHints);
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
    }
  };

  const buyHint = async (hintId, category) => {
    if (!user || !characterId) return;

    try {
      const hint = hints[category].find((h) => h.id === hintId);
      if (!hint) return;

      const { cost, bought = [] } = hint;

      if (characterData.cash < cost) return;
      if (bought.some((buyer) => buyer.character_id === characterId)) return;

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
      fetchHints();
    } catch (error) {
      console.error("Error buying hint: ", error);
    }
  };

  const buyRandomHint = async () => {
    if (!user || !characterId) return;

    try {
      const availableHints = Object.values(hints)
        .flat()
        .filter(
          (hint) =>
            !hint.bought?.some((buyer) => buyer.character_id === characterId)
        );

      if (availableHints.length === 0) return;

      const randomHint =
        availableHints[Math.floor(Math.random() * availableHints.length)];

      if (characterData.cash < randomHint.cost) return;

      const category = Object.keys(hints).find((cat) =>
        hints[cat].some((h) => h.id === randomHint.id)
      );

      await buyHint(randomHint.id, category);
    } catch (error) {
      console.error("Error buying random hint: ", error);
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

      {Object.entries(hints).map(
        ([category, categoryHints]) =>
          categoryHints.length > 0 && (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-semibold capitalize mb-4">
                {category}
              </h2>
              <div className="space-y-6">
                {categoryHints.map((hint) => {
                  const isPurchased = hint.bought?.some(
                    (buyer) =>
                      buyer.character_id === characterId && !buyer.locked
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
                        <p className="text-gray-800">
                          {isPurchased ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: hint.hint }}
                            />
                          ) : (
                            <div>{hint.title}</div>
                          )}
                        </p>
                        <div className="flex items-center space-x-4">
                          {!isPurchased && (
                            <>
                              <span className="text-gray-600 font-semibold">
                                Cost: ${hint.cost}
                              </span>
                              <button
                                onClick={() => buyHint(hint.id, category)}
                                disabled={
                                  (characterData?.cash || 0) < hint.cost
                                }
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
                })}
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default HintPage;