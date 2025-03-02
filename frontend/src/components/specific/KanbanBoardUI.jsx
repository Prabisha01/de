import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  MdAdd,
  MdDelete,
  MdSearch,
  MdSort,
  MdStar,
  MdStarBorder,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";

const KanbanBoard = () => {
  const [boards, setBoards] = useState([]);
  const [sortBy, setSortBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [isSearching, setIsSearching] = useState(false);
  const [visibleBoards, setVisibleBoards] = useState([]); // Renamed filteredBoards to visibleBoards
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const toggleFavorite = async (boardId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/v1/boards/toggleFavorite/${boardId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBoards((prev) =>
        prev.map((board) =>
          board._id === boardId ? response.data.data : board
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setVisibleBoards(sortedBoards); // ✅ Reset to all sorted boards
      return;
    }
  
    const searched = sortedBoards.filter((board) =>
      board.boardName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    setVisibleBoards(searched);
  };
  

  // Sorting logic
  const sortedBoards = [...boards].sort((a, b) => {
    if (sortBy === "favorites") {
      return b.isFavorite - a.isFavorite;
    }
    if (sortBy === "createdDate") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  const handleCreateBoardClick = async () => {
    console.log("handleCreateBoardClick CALLED!");
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, please log in.");
        return;
      }
      if (!user || !user._id) {
        console.error("User ID missing from AuthContext. Please log in again.");
        return;
      }

      const { value: boardName } = await Swal.fire({
        title: "Create New Board",
        input: "text",
        inputLabel: "Enter board name",
        inputPlaceholder: "Board Name",
        showCancelButton: true,
        confirmButtonText: "Create",
        preConfirm: (value) => {
          if (!value) {
            Swal.showValidationMessage("Board name is required");
          }
          return value;
        },
      });

      if (!boardName) return;

      const response = await axios.post(
        "http://localhost:5000/api/v1/boards/createBoard",
        {
          boardName: boardName,
          user: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBoards([...boards, response.data.data]);

      Swal.fire({
        title: "Success!",
        text: "Board Created Successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });

      console.log("Board Created:", response.data);
      navigate(`/boards/${response.data.data._id}/canvas`);
    } catch (error) {
      console.error("Error creating board:", error.response?.data || error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found, please log in.");
      return;
    }

    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the board!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/v1/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBoards(boards.filter((board) => board._id !== boardId));

      Swal.fire({
        title: "Deleted!",
        text: "Board has been deleted.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error deleting board:", error.response?.data || error);
    }
  };

  const fetchBoards = debounce(async (query = "") => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found, redirecting to login...");
      navigate("/sign-in");
      return;
    }

    try {
      let url = "http://localhost:5000/api/v1/boards/getAllBoards";
      if (query) {
        url = `http://localhost:5000/api/v1/boards/search?name=${encodeURIComponent(
          query
        )}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards(response.data.data);
    } catch (error) {
      console.error("Error fetching boards:", error.response?.data || error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  useEffect(() => {
    fetchBoards();
  }, []); 

  useEffect(() => {
    handleSearch(); 
  }, [searchQuery, sortedBoards]); 
   

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedBoards = [...boards];
    s;
    const [movedBoard] = reorderedBoards.splice(result.source.index, 1);
    reorderedBoards.splice(result.destination.index, 0, movedBoard);
    setBoards(reorderedBoards);
  };

  const filteredBoards = Array.isArray(boards)
    ? boards.filter((board) => {
        const matchesSearch = board.boardName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        switch (sortBy) {
          case "favorites":
            return board.isFavorite && matchesSearch;
          case "createdDate":
            return matchesSearch;
          default:
            return matchesSearch;
        }
      })
    : [];

  // Add visual loading state
  const renderLoading = () => (
    <div className="text-center mt-16">
      {" "}
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
      <p className="mt-4 text-gray-500">Searching boards...</p>{" "}
    </div>
  ); // Add empty state

  const renderEmptyState = () => (
    <div className="text-center mt-16 text-gray-400">
      {" "}
      <p className="text-xl">
        {" "}
        {searchQuery
          ? "No boards match your search."
          : "No boards found. Create one to get started!"}{" "}
      </p>{" "}
    </div>
  );

  return (
    <div className="p-2 min-h-screen mx-2 bg-white rounded-md">
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f9f9;
          border-radius: 6px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c6d5fe;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
          transition: background-color 0.2s;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #a5b4fc;
        }

        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c7d2fe #f1f5f9;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-senibold text-neutral-800">My Boards</h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search boards by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} // ✅ Call search on Enter
                className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
             
            </div>

            <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setSortBy("all")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  sortBy === "all"
                    ? "bg-blue-100/35 font-semibold text-cyan-500"
                    : "hover:bg-neutral-100"
                }`}
              >
                All Boards
              </button>
              <button
                onClick={() => setSortBy("favorites")}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  sortBy === "favorites"
                    ? "bg-blue-100/35 font-semibold text-cyan-500"
                    : "hover:bg-neutral-100"
                }`}
              >
                <MdStar className="text-yellow-400" /> Favorites
              </button>
              <button
                onClick={() => setSortBy("createdDate")}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  sortBy === "createdDate"
                    ? "bg-blue-100/35 font-semibold text-cyan-500"
                    : "hover:bg-neutral-100"
                }`}
              >
                <MdSort /> Newest
              </button>
            </div>

            <button
              onClick={handleCreateBoardClick}
              className="flex items-center bg-cyan-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-cyan-400 transition-all duration-200 hover:shadow-lg whitespace-nowrap"
            >
              <MdAdd className="mr-2 text-xl" /> Create Board
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="boards" direction="vertical">
            {(provided) => (
              <div
                className="custom-scroll h-[calc(100vh-12rem)] overflow-y-auto pb-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(visibleBoards) && visibleBoards.length > 0 ? (
  visibleBoards.map((board, index) => (

                      <Draggable
                        key={board._id}
                        draggableId={board._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="transform transition-all duration-200 hover:scale-95 relative"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="flex text-lg justify-end rounded-t-lg shadow border-2 border-gray-300 ">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(board._id);
                                }}
                                className=" top-2 right-10 p-2 text-yellow-300 hover:text-yellow-400 focus:text-yellow-400 transition-colors"
                              >
                                {board.isFavorite ? (
                                  <MdStar className="text-xl" />
                                ) : (
                                  <MdStarBorder className="text-xl" />
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteBoard(board._id)}
                                className=" top-2 right-2 p-2 text-red-400 hover:text-red-600"
                              >
                                <MdDelete />
                              </button>
                            </div>

                            <div
                              onClick={() =>
                                navigate(`/boards/${board._id}/canvas`)
                              }
                              className="h-40 bg-gradient-to-b border-2 hover:border-cyan-700/25 from-white to-cyan-50 rounded-b-xl p-6 cursor-pointer hover:shadow-cyan-300/25 hover:shadow-lg"
                            >
                              <h3 className="text-xl font-bold text-cyan-900 truncate">
                                {board.boardName}
                              </h3>
                              <p className="text-cyan-900/65 mt-2 text-sm">
                                Created:{" "}
                                {new Date(board.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="text-center mt-16 text-neutral-300">
                      <p className="text-xl">
                        {searchQuery
                          ? "No boards match your search."
                          : "No boards found. Create one to get started!"}
                      </p>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
