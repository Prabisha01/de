import { useEffect } from 'react';
import { useCanvas } from './CanvasContext';

const CanvasLayer = () => {
  const { state, dispatch } = useCanvas();
  
  const bringToFront = (elementId) => {
    const sorted = [...state.elements].sort((a, b) => 
      a._id === elementId ? 1 : b._id === elementId ? -1 : 0
    );
    dispatch({ type: 'SET_ELEMENTS', payload: sorted });
  };

  useEffect(() => {
    if (state.selectedElement) {
      bringToFront(state.selectedElement);
    }
  }, [state.selectedElement]);

  return null;
};

export default CanvasLayer;