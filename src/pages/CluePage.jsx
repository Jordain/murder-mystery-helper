import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const CluePage = () => {
  const [clues, setClues] = useState([]);
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

        // Process clues with asynchronous operations
        const fetchedClues = [];

        for (const clueDoc of cluesSnapshot.docs) {
          const clueData = clueDoc.data();

          // Handle traditional character-based clues
          if (clueData.character_id === characterId) {
            if ([0, 1, 3].includes(clueData.round) && clueData.round <= round) {
              fetchedClues.push({ id: clueDoc.id, ...clueData });
            } 
            // Round 2 clues with word matching
            else if (clueData.round === 2) {
              const characterDoc = await getDoc(doc(db, "character", characterId));
              const characterData = characterDoc.data();
              const words = characterData.scores["2"]?.details?.word || [];
              if (words.some((w) => w.word === clueData.word_id)) {
                fetchedClues.push({ id: clueDoc.id, ...clueData });
              }
            }
          }
          
          // Handle game_id 3 clues with solved status - only for round 2 or later
          if (clueData.game_id === 3 && round >= 2) {
            // Check if solved is defined and is an array before processing
            if (Array.isArray(clueData.solved)) {
              const isSolved = clueData.solved.some(
                solved => {
                  return solved.character_id === characterId && solved.locked === false;
                }
              );
              
              if (isSolved) {
                fetchedClues.push({ id: clueDoc.id, ...clueData });
              }
            }
          }
        }

        setClues(fetchedClues);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clues:", error);
        setLoading(false);
      }
    };

    fetchCluesAndRound();
  }, [user]);

  // Rest of the component remains the same as in the previous version
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Clues (Round {currentRound})
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {clues.length > 0 ? (
          clues.map((clue, index) => (
            <div
              key={clue.id}
              className="border rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Clue {index + 1}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                {clue.clue && (Array.isArray(clue.clue) ? 
                  clue.clue.map((clueText, i) => (
                    <li key={i} className="text-gray-700">
                      {clueText}
                    </li>
                  )) : (
                    <li className="text-gray-700">
                      {clue.clue}
                    </li>
                  )
                )}
              </ul>
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