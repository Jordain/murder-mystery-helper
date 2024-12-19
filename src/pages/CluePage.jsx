import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const CluePage = () => {
  const [clues, setClues] = useState([]);
  const [allClues, setAllClues] = useState({});
  const [currentRound, setCurrentRound] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCluesAndRound = async () => {
      if (!user) return;

      try {
        // Fetch current round from admin collection
        const adminQuery = query(collection(db, "admin"));
        const adminSnapshot = await getDocs(adminQuery);
        const adminData = adminSnapshot.docs[0]?.data();
        const round = adminData?.round || 0;
        setCurrentRound(round);

        // Fetch user's character
        const userDoc = await getDoc(doc(db, "user", user.uid));
        const userData = userDoc.data();
        const characterId = userData.character_id;

        // Fetch all clues
        const cluesQuery = query(collection(db, "clue"));
        const cluesSnapshot = await getDocs(cluesQuery);

        const fetchedClues = {};

        for (const clueDoc of cluesSnapshot.docs) {
          const clueData = clueDoc.data();
          const clueRound = clueData.round || 0;

          if (!fetchedClues[clueRound]) {
            fetchedClues[clueRound] = [];
          }

          // Traditional character-based clues
          if (clueData.character_id === characterId) {
            if ([0, 1, 3].includes(clueRound) && clueRound <= round) {
              fetchedClues[clueRound].push({ id: clueDoc.id, ...clueData });
            } else if (clueRound === 2) {
              const characterDoc = await getDoc(
                doc(db, "character", characterId)
              );
              const characterData = characterDoc.data();
              const words = characterData.scores["2"]?.details?.word || [];
              if (words.some((w) => w.word === clueData.word_id)) {
                fetchedClues[clueRound].push({ id: clueDoc.id, ...clueData });
              }
            }
          }

          // Game_id 3 clues for round 2 or later
          if (
            clueData.game_id === 3 &&
            round >= 2 &&
            Array.isArray(clueData.solved)
          ) {
            const isSolved = clueData.solved.some(
              (solved) =>
                solved.character_id === characterId && solved.locked === false
            );
            if (isSolved) {
              fetchedClues[clueRound].push({ id: clueDoc.id, ...clueData });
            }
          }
        }

        setAllClues(fetchedClues);
        setClues(fetchedClues[currentRound] || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clues:", error);
        setLoading(false);
      }
    };

    fetchCluesAndRound();
  }, [user]);

  const handleRoundClick = (round) => {
    setClues(allClues[round] || []);
    setCurrentRound(round);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Clues</h1>

      {/* Round Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.keys(allClues).map((round) => (
          <button
            key={round}
            onClick={() => handleRoundClick(parseInt(round))}
            className={`px-4 py-2 rounded-lg shadow ${
              currentRound === parseInt(round)
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } focus:outline-none`}
          >
            Round {round}
          </button>
        ))}
      </div>

      {/* Clues Display */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : clues.length > 0 ? (
          clues.map((clue, index) => (
            <div key={clue.id} className="space-y-4">
              {/* Regular Clues */}
              {clue.clue && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 shadow-md">
                  <h2 className="text-lg font-semibold text-green-800 mb-2">
                    {currentRound === 1
                      ? "SAY THE FOLLOWING TO OTHERS:"
                      : `Clue ${index + 1}`}
                  </h2>
                  <ul className="list-disc list-inside space-y-2">
                    {Array.isArray(clue.clue) ? (
                      clue.clue.map((text, i) => (
                        <li key={i} className="text-gray-700">
                          {text}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-700">{clue.clue}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Concealed Clues - now outside the round check */}
              {clue.concealed_clue && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 shadow-md">
                  <h2 className="text-lg font-semibold text-red-800 mb-2">
                    THINGS YOU MAY CONCEAL FOR NOW:
                  </h2>
                  <ul className="list-disc list-inside space-y-2">
                    {clue.concealed_clue.map((text, i) => (
                      <li key={i} className="text-gray-700">
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600">
            No clues available for this round.
          </div>
        )}
      </div>
    </div>
  );
};

export default CluePage;
