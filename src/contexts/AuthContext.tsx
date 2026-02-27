import { createContext, useContext, useEffect, useState } from "react";
import { account, tablesDB } from "../integrations/supabase/client.ts";
import { useNavigate } from "react-router-dom";
import { Models, Query } from "appwrite";
interface AuthContextType {
  user: Models.User | null;
  session: Models.Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User | null>(null);
  const [session, setSession] = useState<Models.Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function init() {
    try {
      const userFound = await account.get();
      const { rows: data } = await tablesDB.listRows({
        databaseId: "68b425c600306430be1c",
        tableId: "profiles",
        queries: [Query.equal("email", userFound.email), Query.select(["$id"])],
        total: false,
      });
      userFound.$id = data[0].$id;
      setUser(userFound);
      const currSession = await account.getSession({
        sessionId: "current",
      });
      setSession(currSession);
    } catch (error) {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }
  async function signOut() {
    await account.deleteSession({
      sessionId: "current",
    });
    setUser(null);
  }
  useEffect(() => {
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, session, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
