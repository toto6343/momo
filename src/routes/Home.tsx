import { supabase } from "fbase";
import { useEffect, useState } from "react";
import Nweet from "components/Nweet";
import NweetFactory from "components/NweetFactory";
import { UserObj, NweetObj } from "types";

interface HomeProps {
  userObj: UserObj;
}

const Home = ({ userObj }: HomeProps) => {
  const [nweets, setNweets] = useState<NweetObj[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNweets = async () => {
      const { data, error } = await supabase
        .from("momo")
        .select("*")
        .order("createdAt", { ascending: false });
      
      if (error) {
        console.error("Error fetching nweets:", error);
      } else {
        setNweets(data as NweetObj[]);
      }
      setLoading(false);
    };

    fetchNweets();

    const channel = supabase
      .channel("momo-all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "momo" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNweets((prev) => [payload.new as NweetObj, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setNweets((prev) =>
              prev.map((nweet) =>
                nweet.id === payload.new.id ? (payload.new as NweetObj) : nweet
              )
            );
          } else if (payload.eventType === "DELETE") {
            setNweets((prev) => prev.filter((nweet) => nweet.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl min-h-screen border-r border-gray-800 ml-20 md:ml-64">
      <div className="sticky top-0 z-10 p-4 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <h2 className="text-xl font-bold">Home</h2>
      </div>
      <div className="p-4 border-b border-gray-800">
        <NweetFactory userObj={userObj} />
      </div>
      <div className="pb-20">
        {loading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-800" />
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-800 rounded w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : nweets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-500">
             <p className="text-lg">No moments yet. Start sharing!</p>
          </div>
        ) : (
          nweets.map((nweet) => (
            <Nweet
              key={nweet.id}
              nweetObj={nweet}
              isOwner={nweet.creatorId === userObj.uid}
              userUid={userObj.uid}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
