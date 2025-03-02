// context/ExampleContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ExampleContext = createContext(null);

export const ExampleContextProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("Initial Text");

  const incrementCount = () => {
    setCount(prevCount => prevCount + 1);
  };

    const decrementCount = () => {
    setCount(prevCount => prevCount - 1);
  };

  const updateText = (newText) => {
    setText(newText);
  };

  const contextValue = {
    count,
    incrementCount,
      decrementCount,
    text,
    updateText,
  };

  return (
    <ExampleContext.Provider value={contextValue}>
      {children}
    </ExampleContext.Provider>
  );
};


export const useExampleContext = () => {
  const context = useContext(ExampleContext);
  if (!context) {
    throw new Error("useExampleContext must be used within a ExampleContextProvider");
  }
  return context;
};