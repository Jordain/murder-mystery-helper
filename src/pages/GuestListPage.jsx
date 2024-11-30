import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext"; // Ensure you have this context
import { v4 as uuidv4 } from "uuid"; // Make sure to install uuid package

const GuestListPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBios, setExpandedBios] = useState({});
  const [currentNote, setCurrentNote] = useState({});
  const [suspectStatus, setSuspectStatus] = useState({});
  const [notesList, setNotesList] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const charactersRef = collection(db, "character");
        const charactersSnapshot = await getDocs(charactersRef);

        const charactersList = charactersSnapshot.docs
          .filter((doc) => doc.id !== "t1V3x7zfJIyXZjakIAZV")
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setCharacters(charactersList);

        // Initialize states
        const initialCurrentNote = {};
        const initialSuspectStatus = {};
        const initialNotesList = {};

        charactersList.forEach((char) => {
          // Initialize current note input
          initialCurrentNote[char.id] = "";

          // Initialize suspect status
          const userSpecificData = char.user_notes?.[user.uid] || {};
          initialSuspectStatus[char.id] = userSpecificData.is_suspect || false;

          // Initialize notes list
          initialNotesList[char.id] = userSpecificData.notes_list || [];
        });

        setCurrentNote(initialCurrentNote);
        setSuspectStatus(initialSuspectStatus);
        setNotesList(initialNotesList);
      } catch (error) {
        console.error("Error fetching characters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [user]);

  const toggleBio = (characterId) => {
    setExpandedBios((prev) => ({
      ...prev,
      [characterId]: !prev[characterId],
    }));
  };

  const handleNoteChange = (characterId, note) => {
    setCurrentNote((prev) => ({
      ...prev,
      [characterId]: note,
    }));
  };

  const saveNote = async (characterId) => {
    const noteText = currentNote[characterId].trim();
    if (!noteText) return;

    const newNote = {
      id: uuidv4(),
      text: noteText,
      timestamp: new Date().toISOString(),
    };

    try {
      const characterDocRef = doc(db, "character", characterId);
      await updateDoc(characterDocRef, {
        [`user_notes.${user.uid}.notes_list`]: arrayUnion(newNote),
      });

      // Update local state
      setNotesList((prev) => ({
        ...prev,
        [characterId]: [...(prev[characterId] || []), newNote],
      }));

      // Clear the input
      setCurrentNote((prev) => ({
        ...prev,
        [characterId]: "",
      }));
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const deleteNote = async (characterId, noteToDelete) => {
    try {
      const characterDocRef = doc(db, "character", characterId);
      await updateDoc(characterDocRef, {
        [`user_notes.${user.uid}.notes_list`]: arrayRemove(noteToDelete),
      });

      // Update local state
      setNotesList((prev) => ({
        ...prev,
        [characterId]: prev[characterId].filter(
          (note) => note.id !== noteToDelete.id
        ),
      }));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleSuspectToggle = async (characterId) => {
    const newSuspectStatus = !suspectStatus[characterId];

    try {
      const characterDocRef = doc(db, "character", characterId);
      await updateDoc(characterDocRef, {
        [`user_notes.${user.uid}.is_suspect`]: newSuspectStatus,
      });

      setSuspectStatus((prev) => ({
        ...prev,
        [characterId]: newSuspectStatus,
      }));
    } catch (error) {
      console.error("Error updating suspect status:", error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Guest List</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <div
            key={character.id}
            className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">
                {character.first_name} {character.last_name}
              </h2>
              <div className="flex items-center">
                <label className="flex items-center mr-2">
                  <input
                    type="checkbox"
                    checked={suspectStatus[character.id] || false}
                    onChange={() => handleSuspectToggle(character.id)}
                    className="mr-1"
                  />
                  <span className="text-sm">Suspect</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <p>
                <span className="font-semibold">Job:</span> {character.job}
              </p>
              <p>
                <span className="font-semibold">Relationship:</span>{" "}
                {character.relationship_to_deceased}
              </p>

              {character.bio && (
                <div className="mt-2">
                  <button
                    onClick={() => toggleBio(character.id)}
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    {expandedBios[character.id] ? "Hide Bio" : "Show Bio"}
                  </button>

                  {expandedBios[character.id] && (
                    <p className="mt-2 text-sm text-gray-700 italic">
                      {character.bio}
                    </p>
                  )}
                </div>
              )}

              {/* Notes Section */}
              <div className="mt-4">
                <div className="flex">
                  <input
                    value={currentNote[character.id] || ""}
                    onChange={(e) =>
                      handleNoteChange(character.id, e.target.value)
                    }
                    placeholder="Add a note..."
                    className="flex-grow p-2 border rounded-l-md text-sm"
                  />
                  <button
                    onClick={() => saveNote(character.id)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-r-md hover:bg-blue-600 text-sm"
                  >
                    Save
                  </button>
                </div>

                {/* Notes List */}
                {notesList[character.id] &&
                  notesList[character.id].length > 0 && (
                    <div className="mt-2 border rounded-md p-2 max-h-40 overflow-y-auto">
                      <h3 className="text-sm font-semibold mb-2">My Notes:</h3>
                      <ul className="space-y-1">
                        {notesList[character.id].map((note) => (
                          <li
                            key={note.id}
                            className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                          >
                            <span>{note.text}</span>
                            <button
                              onClick={() => deleteNote(character.id, note)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              🗑️
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
              {/* Scores Section */}
              <div className="border rounded-lg p-4 bg-gray-50 shadow-md mt-4">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Scores</h3>
                <p className="text-green-600 font-bold">
                  Cash: ${character.cash}
                </p>
                <p className="text-blue-600 font-bold">
                  Secret: {character.scores?.[2]?.total_score || 0}
                </p>
                <p className="text-orange-600 font-bold">
                  QR: {character.scores?.[3]?.total_score || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestListPage;
