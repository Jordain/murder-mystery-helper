// pages/CharacterPage.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const CharacterPage = () => {
  const [character, setCharacter] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        // First get user data to get cash amount
        const userDoc = await getDoc(doc(db, "user", user.uid));
        const userData = userDoc.data();

        // Then get character data
        const characterRef = await getDoc(
          doc(db, "character", userData.character_id)
        );
        const characterData = characterRef.data();

        // Fetch objectives for this character
        const objectivesRef = collection(
          db,
          "character",
          userData.character_id,
          "objective"
        );
        const objectivesSnapshot = await getDocs(objectivesRef);
        const objectivesList = objectivesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCharacter({
          ...characterData,
          cash: characterData.cash,
        });
        setObjectives(objectivesList);
      } catch (error) {
        console.error("Error fetching character:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCharacter();
    }
  }, [user]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!character) {
    return <div className="text-center">No character found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Character Information</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {character.first_name} {character.last_name}
          </h2>
          <div className="border rounded-lg p-4 bg-gray-50 shadow-md mt-4">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Scores</h3>
            <p className="text-green-600 font-bold">Cash: ${character.cash}</p>
            <p className="text-blue-600 font-bold">
              Secret: {character.scores?.[2]?.total_score || 0}
            </p>
            <p className="text-orange-600 font-bold">
              QR: {character.scores?.[3]?.total_score || 0}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-extrabold, text-xl mb-2">Secrets Objective:</h3>
          {objectives.length > 0 ? (
            <div>
              {objectives.map((objective) => (
                <div
                  key={objective.id}
                  style={{ marginBottom: "10px" }} // Add space between each record
                  dangerouslySetInnerHTML={{ __html: objective.objective }}
                />
              ))}
            </div>
          ) : (
            <div>No objectives found.</div>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Occupation</h3>
          <p>{character.job}</p>
        </div>

        <div>
          <h3 className="font-semibold">Relationship to Deceased</h3>
          <p>{character.relationship_to_deceased}</p>
        </div>

        <div>
          <h3 className="font-semibold">Biography</h3>
          <p className="whitespace-pre-line">{character.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;
