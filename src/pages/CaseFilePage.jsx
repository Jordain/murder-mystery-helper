import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useAuth } from "../contexts/AuthContext";

const CaseFilePage = () => {
  const [images, setImages] = useState([]);
  const [allImages, setAllImages] = useState({});
  const [currentRound, setCurrentRound] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRound = async () => {
      if (!user) return;
      try {
        // Fetch current round from admin collection
        const adminQuery = query(collection(db, "admin"));
        const adminSnapshot = await getDocs(adminQuery);
        const adminData = adminSnapshot.docs[0]?.data();
        const round = adminData?.round || 0;
        console.log("Current Round: ", round);
        setCurrentRound(round);
      } catch (error) {
        console.error("Error fetching round: ", error);
      }
    };

    fetchRound();
  }, [user]);

  useEffect(() => {
    const fetchCaseFiles = async () => {
      if (currentRound !== null) {
        try {
          // Query case files for all rounds before and including the current round
          const querySnapshot = await getDocs(
            query(
              collection(db, "caseFile"),
              where("round", "<=", currentRound)
            )
          );

          const fetchedImages = {};
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const round = data.round || 0;
            if (!fetchedImages[round]) {
              fetchedImages[round] = [];
            }
            fetchedImages[round].push({ id: doc.id, ...data });
          });

          setAllImages(fetchedImages);
          setImages(fetchedImages[currentRound] || []);
        } catch (error) {
          console.error("Error fetching case files: ", error);
        }
      }
    };

    fetchCaseFiles();
  }, [currentRound]);

  const handleRoundClick = (round) => {
    setImages(allImages[round] || []);
  };

  if (!user || currentRound === null) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "10px", fontFamily: "Arial, sans-serif" }}>
      <h1 className="text-3xl font-bold mb-6 text-center">Case Files</h1>

      {/* Round Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {Object.keys(allImages).map((round) => (
          <button
            key={round}
            onClick={() => handleRoundClick(parseInt(round))}
            style={{
              padding: "10px 20px",
              margin: "0 10px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Round {round}
          </button>
        ))}
      </div>

      {/* Images Display */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            style={{
              width: "90%",
              marginBottom: "20px",
              padding: "10px",
              border: "2px solid #ccc",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#f9f9f9",
            }}
          >
            <img
              src={image.url}
              alt={image.title}
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <h3 style={{ textAlign: "center", marginTop: "10px" }}>
              {image.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseFilePage;
