import React, { useState, useEffect } from "react";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  query,
  collection,
  where,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const QRPage = () => {
  const [inputs, setInputs] = useState(
    Array(24).fill({ value: "", submitted: false, correct: false })
  );
  const [secretSentence, setSecretSentence] = useState("");
  const [error, setError] = useState("");
  const [answerKeys, setAnswerKeys] = useState([]);
  const [characterId, setCharacterId] = useState(null);
  const [solvedWord, setSolvedWord] = useState([]);
  const [solvedSentence, setSolvedSentence] = useState([]);
  const [solvedSentenceBool, setSolvedSentenceBool] = useState([false]);
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchCharacterId = async () => {
      try {
        if (!user?.uid) throw new Error("User UID is undefined");

        const userDoc = await getDoc(doc(db, "user", user.uid));
        if (!userDoc.exists()) throw new Error("User document does not exist");

        const userData = userDoc.data();
        const characterId = userData.character_id?.trim();
        if (!characterId)
          throw new Error(
            "Character ID is missing or invalid in user document"
          );

        setCharacterId(characterId);
      } catch (error) {
        setError("Failed to load user character");
      }
    };

    if (user?.uid) fetchCharacterId();
  }, [user]);

  useEffect(() => {
    if (!characterId) return;

    const fetchAnswerKeys = async () => {
      try {
        const q = query(collection(db, "answerKey"), where("game_id", "==", 3));

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

  useEffect(() => {
    if (!characterId) return;

    const fetchSolvedData = async () => {
      try {
        const characterRef = doc(db, "character", characterId);
        const characterDoc = await getDoc(characterRef);

        if (!characterDoc.exists())
          throw new Error("Character document does not exist");

        const characterData = characterDoc.data();
        const gameScores = characterData.scores?.[3] || {};

        const sentenceSolved = Object.values(
          gameScores.details?.sentence || {}
        ).map((detail) => detail.secret);

        const wordSolved = Object.values(gameScores.details?.word || {}).map(
          (detail) => detail.word
        );

        if (sentenceSolved.length > 0) {
          setSecretSentence(sentenceSolved[0]);
        }

        setSolvedSentence(sentenceSolved);
        setSolvedSentenceBool(!!gameScores.details?.sentence);
        setSolvedWord(wordSolved);

        const updatedInputs = inputs.map((input, index) => {
          const solvedWord = wordSolved[index];
          if (solvedWord) {
            return { value: solvedWord, submitted: true, correct: true };
          }
          return input;
        });

        setInputs(updatedInputs);
      } catch (error) {
        setError("Failed to load solved data");
        console.error(error);
      }
    };

    fetchSolvedData();
  }, [characterId]);

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], value };
    setInputs(newInputs);
  };

  const handleQRSubmit = async (index) => {
    setError("");
    setSuccess("");

    try {
      const valueToCheck = inputs[index].value.trim().toLowerCase();

      // Check against ALL solved words, not just solvedWord
      const allSolvedWords = solvedWord || [];
      if (allSolvedWords.includes(valueToCheck)) {
        setError(`The word "${valueToCheck}" has already been solved.`);
        return;
      }

      // Find the matching answer key
      const matchingKey = answerKeys.find(
        (key) =>
          key.answer.toLowerCase().trim() === valueToCheck &&
          key.game_id === 3 &&
          key.category === "qr"
      );

      if (matchingKey) {
        // Update inputs state
        const newInputs = [...inputs];
        newInputs[index] = {
          value: valueToCheck,
          submitted: true,
          correct: true,
        };
        setInputs(newInputs);

        // Update character score
        const characterRef = doc(db, "character", characterId);
        const characterDoc = await getDoc(characterRef);
        const characterData = characterDoc.data();
        const currentScores = characterData.scores || {};
        const gameScores = currentScores[3] || { total_score: 0, details: {} };

        gameScores.total_score += Number(matchingKey.point_worth);
        gameScores.details.word = gameScores.details.word || [];
        gameScores.details.word.push({
          word: valueToCheck,
          point_worth: matchingKey.point_worth,
          createdAt: Timestamp.now(),
        });

        await setDoc(
          characterRef,
          { scores: { ...currentScores, 3: gameScores } },
          { merge: true }
        );

        // Update the matching clue
        const clueQuery = query(
          collection(db, "clue"),
          where("word_id", "==", valueToCheck),
          where("game_id", "==", 3)
        );
        const clueSnapshot = await getDocs(clueQuery);

        if (!clueSnapshot.empty) {
          const clueDoc = clueSnapshot.docs[0];
          const clueData = clueDoc.data();
          const clueRef = doc(db, "clue", clueDoc.id);
          const updatedCharIds = clueData.char_id ? [...clueData.char_id] : [];

          if (!updatedCharIds.includes(characterId)) {
            // Make sure the 'solved' array exists, if not initialize it
            const solvedEntry = {
              character_id: characterId,
              locked: false, // Unlock the clue for this character
              createdAt: Timestamp.now(),
            };

            // Use arrayUnion to add this entry to the 'solved' array
            await updateDoc(clueRef, {
              solved: arrayUnion(solvedEntry), // This ensures Firestore handles the array correctly
            });
          }

          setSuccess(
            `Correct! You earned ${matchingKey.point_worth} point(s). You unlocked an additional clue for round 2!`
          );
          setSolvedWord([...allSolvedWords, valueToCheck]); // Update solvedWord
        } else {
          setError("Clue not found. Please try again.");
        }
      } else {
        setError("Incorrect. Try again.");
      }
    } catch (error) {
      setError("Failed to submit. Please try again.");
      console.error("Error submitting:", error);
    }
  };

  const handleSentenceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (secretSentence.trim().split(/\s+/).length !== 24) {
      setError("Please enter exactly 24 words.");
      return;
    }

    try {
      const valueToCheck = secretSentence.trim().toLowerCase();

      if (solvedSentence.length > 0) {
        setError(`The sentence has already been solved.`);
        return;
      }

      const matchingKey = answerKeys.find(
        (key) =>
          key.answer.toLowerCase().trim() === valueToCheck &&
          key.game_id === 3 &&
          key.category === "sentence"
      );

      if (matchingKey) {
        // Update character document
        const characterRef = doc(db, "character", characterId);
        const characterDoc = await getDoc(characterRef);
        const characterData = characterDoc.data();
        const currentScores = characterData.scores || {};
        const gameScores = currentScores[3] || { total_score: 0, details: {} };

        gameScores.total_score += Number(matchingKey.point_worth);
        gameScores.details.sentence = [
          { secret: valueToCheck, point_worth: matchingKey.point_worth, createdAt: Timestamp.now()},
        ];

        await setDoc(
          characterRef,
          { scores: { ...currentScores, 3: gameScores } },
          { merge: true }
        );

        setSuccess(`Correct! You earned ${matchingKey.point_worth} point(s).`);
        setSolvedSentenceBool(true);
        setSolvedSentence([valueToCheck]); // Update solvedSentence
      } else {
        setError("Incorrect. Try again.");
      }
    } catch (error) {
      setError("Failed to submit. Please try again.");
      console.error("Error submitting:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">QR Game</h1>

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

      <h2 className="text-xl font-bold mb-4">Individual Inputs</h2>
      <div className="space-y-4">
        {inputs.map((input, index) => (
          <div key={`input-${index}`} className="flex items-center space-x-2">
            <input
              type="text"
              value={input.value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className={`flex-1 p-2 border rounded ${
                input.correct ? "bg-green-100 cursor-not-allowed" : ""
              }`}
              placeholder={`Input ${index + 1}`}
              disabled={input.correct}
            />
            <button
              onClick={() => handleQRSubmit(index, "word")}
              disabled={!input.value || input.correct}
              className={`${
                !input.value || input.correct
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } px-4 py-2 rounded`}
            >
              {input.correct ? "Submitted" : "Submit"}
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-4">Secret Sentence</h2>
      <form onSubmit={handleSentenceSubmit} className="space-y-4">
        <div>
          <textarea
            value={secretSentence}
            onChange={(e) => setSecretSentence(e.target.value)}
            className={`w-full p-2 border rounded h-32 ${
              solvedSentenceBool ? "bg-green-100 cursor-not-allowed" : ""
            }`}
            placeholder="Enter exactly 24 words..."
            required
            disabled={solvedSentenceBool}
          />
          <p className="text-sm text-gray-600 mt-1">
            Word count: {secretSentence.trim().split(/\s+/).length || 0}/24
          </p>
        </div>

        <button
          type="submit"
          disabled={solvedSentenceBool}
          className={`${
            solvedSentenceBool
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          } w-full`}
        >
          {solvedSentenceBool ? "Submitted" : "Save Secret Sentence"}
        </button>
      </form>
    </div>
  );
};

export default QRPage;
