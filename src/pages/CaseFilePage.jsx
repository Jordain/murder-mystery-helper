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

  const renderMediaContent = (item) => {
    // Check if the URL is a YouTube video
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = item.url.match(youtubeRegex);

    // Check if the URL is an image
    const imageRegex = /\.(jpeg|jpg|gif|png|webp)$/i;
    const isImage = imageRegex.test(item.url);

    if (youtubeMatch) {
      // Render YouTube video
      const videoId = youtubeMatch[1];
      return (
        <div 
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
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={item.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: "8px" }}
          />
          <h3 style={{ textAlign: "center", marginTop: "10px" }}>
            {item.title}
          </h3>
        </div>
      );
    } else if (isImage) {
      // Render image (existing logic)
      return (
        <div
          key={item.id}
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
            src={item.url}
            alt={item.title}
            style={{ width: "100%", borderRadius: "8px" }}
          />
          <h3 style={{ textAlign: "center", marginTop: "10px" }}>
            {item.title}
          </h3>
        </div>
      );
    } else {
      // Render external link
      return (
        <div
          key={item.id}
          style={{
            width: "90%",
            marginBottom: "20px",
            padding: "10px",
            border: "2px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9f9f9",
            textAlign: "center"
          }}
        >
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "5px",
              marginTop: "10px"
            }}
          >
            {item.title}
          </a>
        </div>
      );
    }
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

      {/* Media Display */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {images.map((item) => renderMediaContent(item))}
      </div>
    </div>
  );
};

export default CaseFilePage;