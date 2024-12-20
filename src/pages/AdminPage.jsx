import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const AdminPanel = () => {
  const [currentRound, setCurrentRound] = useState(0);
  const [adminDocId, setAdminDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPermission, setUserPermission] = useState(null);

  // Murderer votes states
  const [murdererVotes, setMurdererVotes] = useState([]);
  const [murdererVoteCounts, setMurdererVoteCounts] = useState([]);

  // Best Dressed votes states
  const [bestDressedVotes, setBestDressedVotes] = useState([]);
  const [bestDressedVoteCounts, setBestDressedVoteCounts] = useState([]);

  // Best Actor votes states
  const [bestActorVotes, setBestActorVotes] = useState([]);
  const [bestActorVoteCounts, setBestActorVoteCounts] = useState([]);

  // Favorite Mini Game votes states
  const [miniGameVotes, setMiniGameVotes] = useState([]);
  const [miniGameVoteCounts, setMiniGameVoteCounts] = useState([]);

  const [secretStringScores, setSecretStringScores] = useState([]);
  const [qrCodeScores, setQRCodeScores] = useState([]);

  const [characterCashRankings, setCharacterCashRankings] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    const fetchCashRankings = async () => {
      try {
        // Fetch characters
        const charactersRef = collection(db, "character");
        const charactersSnapshot = await getDocs(charactersRef);

        // Fetch users to get usernames
        const usersRef = collection(db, "user");
        const usersSnapshot = await getDocs(usersRef);

        // Create a map of character IDs to usernames
        const userCharacterMap = new Map(
          usersSnapshot.docs
            .filter((userDoc) => userDoc.data().character_id)
            .map((userDoc) => [
              userDoc.data().character_id,
              userDoc.data().username,
            ])
        );

        // Process Cash Rankings - add filtering here
        const cashRankings = charactersSnapshot.docs
          .filter(
            (doc) =>
              ![
                "t1V3x7zfJIyXZjakIAZV",
                "t1V3x7zfJIyXZjakIAZV2",
                "d2wv9hw2m3wHsih4XmOK19",
                "d2wv9hw2m3wHsih4XmOK20",
                "d2wv9hw2m3wHsih4XmOK21",
              ].includes(doc.id)
          )
          .map((doc) => {
            const characterData = doc.data();
            return {
              characterId: doc.id,
              characterName: `${characterData.first_name} ${characterData.last_name}`,
              username: userCharacterMap.get(doc.id) || "N/A",
              cash: characterData.cash || 0,
              job: characterData.job || "Unknown",
            };
          })
          .sort((a, b) => b.cash - a.cash);

        setCharacterCashRankings(cashRankings);
      } catch (error) {
        console.error("Error fetching cash rankings:", error);
      }
    };

    // Only fetch if user is an admin
    if (userPermission === "admin") {
      fetchCashRankings();
    }
  }, [userPermission]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        // Fetch characters
        const charactersRef = collection(db, "character");
        const charactersSnapshot = await getDocs(charactersRef);

        // Fetch users to get usernames
        const usersRef = collection(db, "user");
        const usersSnapshot = await getDocs(usersRef);

        // Create a map of character IDs to usernames
        const userCharacterMap = new Map(
          usersSnapshot.docs
            .filter((userDoc) => userDoc.data().character_id)
            .map((userDoc) => [
              userDoc.data().character_id,
              userDoc.data().username,
            ])
        );

        // Excluded character IDs
        const excludedCharacterIds = [
          "t1V3x7zfJIyXZjakIAZV",
          "t1V3x7zfJIyXZjakIAZV2",
          "d2wv9hw2m3wHsih4XmOK19",
          "d2wv9hw2m3wHsih4XmOK20",
          "d2wv9hw2m3wHsih4XmOK21",
        ];
        // Process Secret String (Round 2) Scores
        const secretStringResults = charactersSnapshot.docs
          .filter((doc) => !excludedCharacterIds.includes(doc.id))
          .map((doc) => {
            const characterData = doc.data();
            const scoreData = characterData.scores?.[2];
            return scoreData
              ? {
                  characterId: doc.id,
                  characterName: `${characterData.first_name} ${characterData.last_name}`,
                  username: userCharacterMap.get(doc.id) || "N/A",
                  totalScore: scoreData.total_score || 0,
                }
              : null;
          })
          .filter((score) => score !== null)
          .sort((a, b) => b.totalScore - a.totalScore);

        // Process QR Code (Round 3) Scores
        const qrCodeResults = charactersSnapshot.docs
          .filter((doc) => !excludedCharacterIds.includes(doc.id))
          .map((doc) => {
            const characterData = doc.data();
            const scoreData = characterData.scores?.[3];
            return scoreData
              ? {
                  characterId: doc.id,
                  characterName: `${characterData.first_name} ${characterData.last_name}`,
                  username: userCharacterMap.get(doc.id) || "N/A",
                  totalScore: scoreData.total_score || 0,
                }
              : null;
          })
          .filter((score) => score !== null)
          .sort((a, b) => b.totalScore - a.totalScore);

        setSecretStringScores(secretStringResults);
        setQRCodeScores(qrCodeResults);
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    // Only fetch if user is an admin
    if (userPermission === "admin") {
      fetchScores();
    }
  }, [userPermission]);

  useEffect(() => {
    const processCategoryVotes = (
      votesSnapshot,
      usersMap,
      charactersMap,
      category
    ) => {
      const processedVotes = [];
      const voteCountMap = new Map();
      const excludedCharacterIds = [
        "t1V3x7zfJIyXZjakIAZV",
        "t1V3x7zfJIyXZjakIAZV2",
        "d2wv9hw2m3wHsih4XmOK19",
        "d2wv9hw2m3wHsih4XmOK20",
        "d2wv9hw2m3wHsih4XmOK21",
      ];

      votesSnapshot.docs.forEach((voteDoc) => {
        const voteData = voteDoc.data();
        if (voteData.category === category) {
          const voter = usersMap.get(voteData.char_id);
          const character = charactersMap.get(voter.character_id);

          // Skip if voter or voted character is in excluded list
          if (
            !character ||
            excludedCharacterIds.includes(voter.character_id) ||
            excludedCharacterIds.includes(voteData.voted_for)
          ) {
            return;
          }

          // Special handling for mini-game category
          if (category === "mini-game") {
            const vote = {
              username: voter.username,
              characterFirstName: character.first_name,
              characterLastName: character.last_name,
              votedFor: voteData.voted_for,
              votedForName: voteData.voted_for, // Use voted_for directly
              timestamp: voteData.created_at.toDate(),
            };

            processedVotes.push(vote);

            // Count votes for mini-game
            const voteCount = (voteCountMap.get(vote.votedFor) || 0) + 1;
            voteCountMap.set(vote.votedFor, voteCount);
          } else {
            // Existing logic for other categories
            const votedForCharacter = charactersMap.get(voteData.voted_for);

            if (voter && votedForCharacter && character) {
              const vote = {
                username: voter.username,
                characterFirstName: character.first_name,
                characterLastName: character.last_name,
                votedFor: voteData.voted_for,
                votedForName: `${votedForCharacter.first_name} ${votedForCharacter.last_name}`,
                timestamp: voteData.created_at.toDate(),
              };

              processedVotes.push(vote);

              // Count votes
              const voteCount = (voteCountMap.get(vote.votedFor) || 0) + 1;
              voteCountMap.set(vote.votedFor, voteCount);
            }
          }
        }
      });

      // Sort processed votes by timestamp in ascending order
      processedVotes.sort((a, b) => a.timestamp - b.timestamp);

      // Convert vote count map to sorted array
      const sortedVoteCounts = Array.from(voteCountMap.entries())
        .map(([key, voteCount]) => {
          // For mini-game, key is the mini-game name itself
          return {
            characterId: key,
            characterName:
              category === "mini-game"
                ? key
                : charactersMap.get(key)
                ? `${charactersMap.get(key).first_name} ${
                    charactersMap.get(key).last_name
                  }`
                : "Unknown",
            voteCount,
          };
        })
        .sort((a, b) => b.voteCount - a.voteCount);

      return { processedVotes, sortedVoteCounts };
    };

    const fetchAllVotes = async () => {
      try {
        // Fetch votes
        const votesRef = collection(db, "vote");
        const votesSnapshot = await getDocs(votesRef);

        // Fetch users and characters
        const usersRef = collection(db, "user");
        const usersSnapshot = await getDocs(usersRef);
        const charactersRef = collection(db, "character");
        const charactersSnapshot = await getDocs(charactersRef);

        // Create maps for easy lookup
        const usersMap = new Map(
          usersSnapshot.docs.map((doc) => [doc.id, doc.data()])
        );
        const charactersMap = new Map(
          charactersSnapshot.docs.map((doc) => [doc.id, doc.data()])
        );

        // Process votes for each category
        const murdererResults = processCategoryVotes(
          votesSnapshot,
          usersMap,
          charactersMap,
          "murderer"
        );
        const bestDressedResults = processCategoryVotes(
          votesSnapshot,
          usersMap,
          charactersMap,
          "costume"
        );
        const bestActorResults = processCategoryVotes(
          votesSnapshot,
          usersMap,
          charactersMap,
          "actor"
        );
        const miniGameResults = processCategoryVotes(
          votesSnapshot,
          usersMap,
          charactersMap,
          "mini-game"
        );

        // Update states
        setMurdererVotes(murdererResults.processedVotes);
        setMurdererVoteCounts(murdererResults.sortedVoteCounts);

        setBestDressedVotes(bestDressedResults.processedVotes);
        setBestDressedVoteCounts(bestDressedResults.sortedVoteCounts);

        setBestActorVotes(bestActorResults.processedVotes);
        setBestActorVoteCounts(bestActorResults.sortedVoteCounts);

        setMiniGameVotes(miniGameResults.processedVotes);
        setMiniGameVoteCounts(miniGameResults.sortedVoteCounts);
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

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

        // Fetch all votes
        await fetchAllVotes();
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

  const renderScoreSection = (title, scores) => (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title} Scores</h2>
      <div className="border rounded-lg p-4 bg-gray-50 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Username</th>
                <th className="border p-2">Character</th>
                <th className="border p-2">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr key={score.characterId} className="hover:bg-gray-100">
                  <td className="border p-2">{score.username}</td>
                  <td className="border p-2">{score.characterName}</td>
                  <td className="border p-2">{score.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Reusable function to render cash rankings section
  const renderCashRankingsSection = (rankings) => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Character Cash Rankings</h2>
      <div className="border rounded-lg p-4 bg-gray-50 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Username</th>
                <th className="border p-2">Character</th>
                <th className="border p-2">Job</th>
                <th className="border p-2">Cash</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((character) => (
                <tr key={character.characterId} className="hover:bg-gray-100">
                  <td className="border p-2">{character.username}</td>
                  <td className="border p-2">{character.characterName}</td>
                  <td className="border p-2">{character.job}</td>
                  <td className="border p-2">
                    ${character.cash.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  const renderVoteSection = (title, votes, voteCounts) => (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title} Votes</h2>
      <div className="border rounded-lg p-4 bg-gray-50 shadow-md">
        {/* Votes Table */}
        <h3 className="text-lg font-semibold mb-2">Vote Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Username</th>
                <th className="border p-2">Character</th>
                <th className="border p-2">Voted For</th>
                <th className="border p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border p-2">{vote.username}</td>
                  <td className="border p-2">
                    {vote.characterFirstName} {vote.characterLastName}
                  </td>
                  <td className="border p-2">{vote.votedForName}</td>
                  <td className="border p-2">
                    {vote.timestamp.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vote Counts */}
        <h3 className="text-lg font-semibold mt-4 mb-2">Vote Counts</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Character</th>
                <th className="border p-2">Vote Count</th>
              </tr>
            </thead>
            <tbody>
              {voteCounts.map((voteCount) => (
                <tr key={voteCount.characterId} className="hover:bg-gray-100">
                  <td className="border p-2">{voteCount.characterName}</td>
                  <td className="border p-2">{voteCount.voteCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (!loading && (!user || userPermission !== "admin")) {
    return <Navigate to="/character" replace />;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Existing Round Selection Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Round</h2>
          <div className="border rounded-lg p-4 bg-gray-50 shadow-md">
            <label
              htmlFor="round-select"
              className="text-lg font-bold text-gray-700 mb-2"
            >
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

        {/* Murderer Votes Section */}
        {renderVoteSection("Murderer", murdererVotes, murdererVoteCounts)}

        {/* Best Dressed Votes Section */}
        {renderVoteSection(
          "Best Costume",
          bestDressedVotes,
          bestDressedVoteCounts
        )}

        {/* Best Actor Votes Section */}
        {renderVoteSection("Best Actor", bestActorVotes, bestActorVoteCounts)}

        {/* Favorite Mini Game Votes Section */}
        {renderVoteSection(
          "Favorite Mini Game",
          miniGameVotes,
          miniGameVoteCounts
        )}
        {/* Secret String Scores Section */}
        {renderScoreSection("Secret String", secretStringScores)}

        {/* QR Code Scores Section */}
        {renderScoreSection("QR Code", qrCodeScores)}

        {/* Character Cash Rankings Section */}
        {renderCashRankingsSection(characterCashRankings)}
      </div>
    </div>
  );
};

export default AdminPanel;
