import { createContext, useContext, useState, useMemo } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ tasks, setTasks }), [tasks]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};