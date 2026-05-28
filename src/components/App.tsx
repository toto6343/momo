import { useEffect, useState } from "react";
import AppRouter from "components/Router";
import { supabase } from "fbase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { UserObj } from "types";
import { Toaster } from "react-hot-toast";

function App() {
  const [init, setInit] = useState(false);
  const [userObj, setUserObj] = useState<UserObj | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        setUserObj({
          uid: user.id,
          displayName: user.user_metadata.displayName || user.email,
          photoURL: user.user_metadata.photoURL || null,
          updateProfile: async (args: any) => {
            const { data, error } = await supabase.auth.updateUser({
              data: args
            });
            if (error) throw error;
            return data;
          },
        });
      } else {
        setUserObj(null);
      }
      setInit(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserObj({
        uid: user.id,
        displayName: user.user_metadata.displayName || user.email,
        photoURL: user.user_metadata.photoURL || null,
        updateProfile: async (args: any) => {
          const { data, error } = await supabase.auth.updateUser({
            data: args
          });
          if (error) throw error;
          return data;
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      {init ? (
        <AppRouter
          refreshUser={refreshUser}
          isLoggedIn={Boolean(userObj)}
          userObj={userObj}
        />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <FontAwesomeIcon icon={faComment} className="text-purple-500 animate-pulse text-6xl" />
        </div>
      )}
    </div>
  );
}

export default App;
