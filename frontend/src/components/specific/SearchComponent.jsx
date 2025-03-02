import axios from "axios";
import React, { useEffect, useState } from "react";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/boards/search?q=${query}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setResults(response.data.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search boards..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <div className="search-results">
        {results.length > 0 ? (
          results.map((board) => (
            <div key={board._id} className="board-item">
              <h3>{board.boardName}</h3>
              {/* Add more board details as needed */}
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
