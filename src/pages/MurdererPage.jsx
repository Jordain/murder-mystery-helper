import React, { useState, useEffect } from "react";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const MurdererPage = () => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("murderer");
  const [hasVoted, setHasVoted] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const categories = [
    { id: "murderer", name: "Who Is The Murderer?" },
    { id: "costume", name: "Best Costume" },
    { id: "actor", name: "Best Actor" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all characters
        const charactersSnapshot = await getDocs(collection(db, "character"));
        const charactersData = charactersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCharacters(charactersData);

        // Check if user has already voted for the selected category
        const voteDoc = await getDoc(
          doc(db, "vote", `${user.uid}-${selectedCategory}`)
        );
        if (voteDoc.exists()) {
          setHasVoted(true);
          setSelectedCharacter(voteDoc.data().voted_for);
        } else {
          setHasVoted(false);
          setSelectedCharacter("");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCharacter) {
      setError("Please select a character");
      return;
    }

    try {
      // Save the vote with a timestamp
      await setDoc(doc(db, "vote", `${user.uid}-${selectedCategory}`), {
        game_id: 1, // You might want to make this dynamic
        char_id: user.uid,
        category: selectedCategory,
        voted_for: selectedCharacter,
        created_at: serverTimestamp(), // Automatically set to current time
      });

      setHasVoted(true);
      setSuccess("Your vote has been recorded!");
    } catch (error) {
      setError("Failed to submit vote. Please try again.");
      console.error("Vote submission error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Cast Your Votes!</h1>

      <div className="flex flex-col space-y-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`p-4 rounded-lg text-white font-bold ${
              selectedCategory === cat.id
                ? "bg-blue-600"
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold mb-4">
            {categories.find((cat) => cat.id === selectedCategory)?.name}
          </h2>
          <div>
            <label className="block text-gray-700 mb-2">
              Select your choice:
            </label>
            <select
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={hasVoted}
              required
            >
              <option value="">Select a character</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.first_name} {char.last_name}
                </option>
              ))}
            </select>
          </div>

          {!hasVoted && (
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Submit Vote
            </button>
          )}

          {hasVoted && (
            <div className="text-center text-gray-600">
              You have already submitted your vote for this category.
            </div>
          )}
          <p className="text-red-600"><b>Be careful</b>—once you submit your vote, it cannot be changed.</p>
        </form>
      </div>
    </div>
  );
};

export default MurdererPage;
