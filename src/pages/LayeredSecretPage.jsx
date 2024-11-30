import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const LayeredSecretPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('secrets');
  const categories = [
    { id: 'secrets', name: 'Secrets' },
    { id: 'rumors', name: 'Rumors' }
  ];

  const [secrets, setSecrets] = useState([
    { value: "", submitted: false, correct: false },
    { value: "", submitted: false, correct: false },
    { value: "", submitted: false, correct: false },
  ]);
  const [rumors, setRumors] = useState(
    Array(16).fill().map(() => ({ value: "", submitted: false, correct: false }))
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [answerKeys, setAnswerKeys] = useState([]);
  const { user } = useAuth();
  const [characterId, setCharacterId] = useState(null);
  const [solvedSecrets, setSolvedSecrets] = useState([]); 
  const [solvedRumors, setSolvedRumors] = useState([]);

  // Fetch character ID when component mounts
  useEffect(() => {
    const fetchCharacterId = async () => {
      try {
        if (!user?.uid) {
          throw new Error("User UID is undefined");
        }

        const userDoc = await getDoc(doc(db, "user", user.uid));
        if (!userDoc.exists()) {
          throw new Error("User document does not exist");
        }

        const userData = userDoc.data();
        const characterId = userData.character_id?.trim();
        if (!characterId) {
          throw new Error(
            "Character ID is missing or invalid in user document"
          );
        }

        setCharacterId(characterId);
      } catch (error) {
        setError("Failed to load user character");
      }
    };

    if (user?.uid) {
      fetchCharacterId();
    }
  }, [user]);

  // Fetch answer keys when character ID is available
  useEffect(() => {
    if (!characterId) return;

    const fetchAnswerKeys = async () => {
      try {
        // Fetch all answer keys for this game
        const q = query(collection(db, "answerKey"), where("game_id", "==", 2));

        const querySnapshot = await getDocs(q);
        const keys = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAnswerKeys(keys);
      } catch (error) {
        setError("Failed to load game data");
      }
    };

    fetchAnswerKeys();
  }, [characterId]);

  // Fetch solved secrets and rumors from Firestore
  useEffect(() => {
    if (!characterId) return;

    const fetchSolvedData = async () => {
      try {
        const characterRef = doc(db, "character", characterId);
        const characterDoc = await getDoc(characterRef);

        if (!characterDoc.exists()) {
          throw new Error("Character document does not exist");
        }

        const characterData = characterDoc.data();
        const gameScores = characterData.scores?.[2] || {};

        // Handle secrets
        const secretsSolved = Object.values(
          gameScores.details?.secrets || {}
        ).map((detail) => detail.secret);

        // Handle rumors
        const rumorsSolved = Object.values(
          gameScores.details?.rumors || {}
        ).map((detail) => detail.rumor);

        setSolvedSecrets(secretsSolved);
        setSolvedRumors(rumorsSolved);

        // Update secrets state
        const updatedSecrets = secrets.map((secret, index) => {
          const solvedSecret = secretsSolved[index];
          if (solvedSecret) {
            return { value: solvedSecret, submitted: true, correct: true };
          }
          return secret;
        });

        // Update rumors state
        const updatedRumors = rumors.map((rumor, index) => {
          const solvedRumor = rumorsSolved[index];
          if (solvedRumor) {
            return { value: solvedRumor, submitted: true, correct: true };
          }
          return rumor;
        });

        setSecrets(updatedSecrets);
        setRumors(updatedRumors);
      } catch (error) {
        setError("Failed to load solved data");
        console.error(error);
      }
    };

    fetchSolvedData();
  }, [characterId]);

  const handleSecretChange = (index, value, type) => {
    if (type === 'secrets') {
      const newSecrets = [...secrets];
      if (!newSecrets[index].correct) {
        newSecrets[index] = { ...newSecrets[index], value };
        setSecrets(newSecrets);
      }
    } else {
      const newRumors = [...rumors];
      if (!newRumors[index].correct) {
        newRumors[index] = { ...newRumors[index], value };
        setRumors(newRumors);
      }
    }
  };

const handleSecretSubmit = async (index, type) => {
  setError("");
  setSuccess("");

  try {
    const valueToCheck = type === 'secrets' 
      ? secrets[index].value.trim().toLowerCase()
      : rumors[index].value.trim().toLowerCase();

    // Check if already solved
    const solvedList = type === 'secrets' ? solvedSecrets : solvedRumors;
    if (solvedList.includes(valueToCheck)) {
      setError(`The ${type.slice(0, -1)} "${valueToCheck}" has already been solved.`);
      return;
    }

    let matchingKey;

    if (type === 'secrets') {
      // For secrets: character_id must match
      matchingKey = answerKeys.find(
        (key) =>
          key.answer.toLowerCase().trim() === valueToCheck &&
          key.character_id === characterId && // Ensure the character ID matches
          key.game_id === 2 &&
          key.category === 'secret' // Optional: enforce the category
      );
    } else {
      // For rumors: no character_id restriction
      matchingKey = answerKeys.find(
        (key) =>
          key.answer.toLowerCase().trim() === valueToCheck &&
          key.game_id === 2 &&
          key.category === 'rumor' // Optional: enforce the category
      );
    }

    if (type === 'secrets') {
      const newSecrets = [...secrets];
      if (matchingKey) {
        newSecrets[index] = {
          value: valueToCheck,
          submitted: true,
          correct: true,
        };
        setSecrets(newSecrets);
        setSolvedSecrets([...solvedSecrets, valueToCheck]);
      } else {
        newSecrets[index] = { ...newSecrets[index], submitted: true };
        setSecrets(newSecrets);
        setError("Incorrect secret. Try again.");
      }
    } else {
      const newRumors = [...rumors];
      if (matchingKey) {
        newRumors[index] = {
          value: valueToCheck,
          submitted: true,
          correct: true,
        };
        setRumors(newRumors);
        setSolvedRumors([...solvedRumors, valueToCheck]);
      } else {
        newRumors[index] = { ...newRumors[index], submitted: true };
        setRumors(newRumors);
        setError("Incorrect rumor. Try again.");
      }
    }

    if (matchingKey) {
      // Update Firestore score (similar to previous implementation)
      const characterRef = doc(db, "character", characterId);
      const characterDoc = await getDoc(characterRef);
      const characterData = characterDoc.data();
      const currentScores = characterData.scores || {};
      const gameScores = currentScores[2] || { total_score: 0, details: {} };

      gameScores.total_score = Number((gameScores.total_score || 0) + Number(matchingKey.point_worth));
      gameScores.details = gameScores.details || {};
      gameScores.details[type] = gameScores.details[type] || {};
      gameScores.details[type][`${type.slice(0, -1)}_${index}`] = {
        [type.slice(0, -1)]: valueToCheck,
        point_worth: matchingKey.point_worth,
      };

      await setDoc(
        characterRef,
        { scores: { ...currentScores, 2: gameScores } },
        { merge: true }
      );

      setSuccess(`Correct! You earned ${matchingKey.point_worth} point(s).`);
    }
  } catch (error) {
    setError("Failed to submit. Please try again.");
    console.error("Error submitting:", error);
  }
};

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Secrets & Rumors</h1>
      
      <div className="flex space-x-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-1 p-2 rounded-lg text-white font-bold ${
              selectedCategory === cat.id
                ? "bg-blue-600"
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {cat.name}
          </button>
        ))}
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

      <div className="space-y-4">
        {selectedCategory === 'secrets' 
          ? secrets.map((secret, index) => (
              <div key={`secret-${index}`} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={secret.value}
                  onChange={(e) => handleSecretChange(index, e.target.value, 'secrets')}
                  className={`flex-1 p-2 border rounded ${
                    secret.correct ? "bg-green-100 cursor-not-allowed" : ""
                  }`}
                  placeholder={`Secret ${index + 1}`}
                  disabled={secret.correct}
                />
                <button
                  onClick={() => handleSecretSubmit(index, 'secrets')}
                  disabled={!secret.value || secret.correct}
                  className={`px-4 py-2 rounded ${
                    !secret.value || secret.correct
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {secret.correct ? "Solved" : "Submit"}
                </button>
              </div>
            ))
          : rumors.map((rumor, index) => (
              <div key={`rumor-${index}`} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={rumor.value}
                  onChange={(e) => handleSecretChange(index, e.target.value, 'rumors')}
                  className={`flex-1 p-2 border rounded ${
                    rumor.correct ? "bg-green-100 cursor-not-allowed" : ""
                  }`}
                  placeholder={`Rumor ${index + 1}`}
                  disabled={rumor.correct}
                />
                <button
                  onClick={() => handleSecretSubmit(index, 'rumors')}
                  disabled={!rumor.value || rumor.correct}
                  className={`px-4 py-2 rounded ${
                    !rumor.value || rumor.correct
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {rumor.correct ? "Solved" : "Submit"}
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default LayeredSecretPage;