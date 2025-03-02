import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';

const CanvasContext = createContext();

const initialState = {
  elements: [],
  selectedElement: null,
  activeTool: 'select',
  boardData: null,
  loading: true,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_BOARD':
      return { 
        ...state, 
        boardData: action.payload,
        elements: action.payload?.elements || [],
        loading: false
      };
    case 'ADD_ELEMENT':
      return { ...state, elements: [...state.elements, action.payload] };
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el => 
          el._id === action.payload._id ? action.payload : el
        )
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TOOL':
      return { ...state, activeTool: action.payload };
    case 'SELECT_ELEMENT':
      return { ...state, selectedElement: action.payload };
    default:
      return state;
  }
};

export const CanvasProvider = ({ children, boardId }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useContext(AuthContext);

  const fetchBoard = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`/api/v1/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      dispatch({ type: 'SET_BOARD', payload: response.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || "Failed to load board" });
    }
  };

  const persistElement = async (element) => {
    try {
      const res = await axios.put(`/api/v1/elements/${element._id}`, element, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      dispatch({ type: 'UPDATE_ELEMENT', payload: res.data.data });
    } catch (err) {
      console.error("Error saving element:", err);
    }
  };

  useEffect(() => {
    if (boardId && user) fetchBoard();
  }, [boardId, user?.token]);

  return (
    <CanvasContext.Provider value={{ state, dispatch, persistElement }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);