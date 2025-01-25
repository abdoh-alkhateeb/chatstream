import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export const AuthContext = createContext<{ token: string | null; setToken: (token: string | null) => void }>({
  token: null,
  setToken: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
