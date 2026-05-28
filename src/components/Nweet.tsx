import { supabase } from "fbase";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencilAlt, faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import { NweetObj } from "types";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface NweetProps {
  nweetObj: NweetObj;
  isOwner: boolean;
  userUid: string;
}

const Nweet = ({ nweetObj, isOwner, userUid }: NweetProps) => {
  const [editing, setEditing] = useState(false);
  const [newNweet, setNewNweet] = useState(nweetObj.text);

  const isLiked = nweetObj.likes?.includes(userUid);

  const onLikeClick = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("momo")
        .select("likes")
        .eq("id", nweetObj.id)
        .single();
      
      if (fetchError) throw fetchError;

      let newLikes = data?.likes || [];
      if (isLiked) {
        newLikes = newLikes.filter((id: string) => id !== userUid);
      } else {
        newLikes = [...newLikes, userUid];
      }

      const { error: updateError } = await supabase
        .from("momo")
        .update({ likes: newLikes })
        .eq("id", nweetObj.id);
      
      if (updateError) throw updateError;
    } catch (error) {
      toast.error("Failed to update like.");
    }
  };

  const onDeleteClick = async () => {
    const ok = window.confirm("Are you sure you want to delete this moment?");
    if (ok) {
      try {
        const { error: deleteError } = await supabase
          .from("momo")
          .delete()
          .eq("id", nweetObj.id);
        
        if (deleteError) throw deleteError;

        if (nweetObj.attachmentUrl !== "") {
          const path = nweetObj.attachmentUrl.split("/momo_storage/")[1];
          if (path) {
            await supabase.storage.from("momo_storage").remove([path]);
          }
        }
        toast.success("Moment deleted.");
      } catch (error) {
        toast.error("Failed to delete moment.");
      }
    }
  };

  const toggleEditing = () => setEditing((prev) => !prev);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewNweet(event.target.value);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { error } = await supabase
        .from("momo")
        .update({ text: newNweet })
        .eq("id", nweetObj.id);
      
      if (error) throw error;
      setEditing(false);
      toast.success("Moment updated.");
    } catch (error) {
      toast.error("Failed to update moment.");
    }
  };

  return (
    <div className="p-4 border-b border-gray-800 hover:bg-white/[0.03] transition-colors">
      {editing ? (
        <div className="flex flex-col space-y-3">
          <form onSubmit={onSubmit} className="flex flex-col space-y-2">
            <input
              onChange={onChange}
              value={newNweet}
              required
              placeholder="Edit your moment"
              autoFocus
              className="w-full bg-transparent border border-gray-700 rounded-lg p-2 focus:outline-none focus:border-purple-500"
            />
            <div className="flex space-x-2">
              <input
                type="submit"
                value="Update"
                className="px-4 py-1 bg-purple-600 text-white rounded-full text-sm font-bold cursor-pointer"
              />
              <button
                onClick={toggleEditing}
                className="px-4 py-1 bg-gray-700 text-white rounded-full text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {nweetObj.photoURL ? (
              <img src={nweetObj.photoURL} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 font-bold">{nweetObj.displayName?.[0] || "?"}</span>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="font-bold hover:underline cursor-pointer">
                  {nweetObj.displayName || "User"}
                </span>
                <span className="text-gray-500 text-sm">
                  · {formatDistanceToNow(nweetObj.createdAt, { addSuffix: true })}
                </span>
              </div>
              {isOwner && (
                <div className="flex space-x-3 text-gray-500">
                   <button onClick={toggleEditing} className="hover:text-purple-500 transition-colors p-1">
                    <FontAwesomeIcon icon={faPencilAlt} size="sm" />
                  </button>
                  <button onClick={onDeleteClick} className="hover:text-red-500 transition-colors p-1">
                    <FontAwesomeIcon icon={faTrash} size="sm" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-white whitespace-pre-wrap">{nweetObj.text}</p>
            {nweetObj.attachmentUrl && (
              <div className="mt-2">
                <img
                  src={nweetObj.attachmentUrl}
                  alt="attachment"
                  className="rounded-2xl max-h-80 w-auto border border-gray-800"
                />
              </div>
            )}
            <div className="flex items-center space-x-6 pt-2 text-gray-500">
              <button
                onClick={onLikeClick}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked ? "text-red-500" : "hover:text-red-500"
                }`}
              >
                <div className={`p-2 rounded-full ${isLiked ? "" : "hover:bg-red-500/10"}`}>
                  <FontAwesomeIcon icon={isLiked ? faHeart : farHeart} />
                </div>
                <span className={`text-sm ${isLiked ? "text-red-500" : ""}`}>
                  {nweetObj.likes?.length || 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nweet;
