import { supabase } from "fbase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserObj } from "types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { compressImage } from "utils/imageUtils";

interface ProfileProps {
  userObj: UserObj;
  refreshUser: () => void;
}

const Profile = ({ userObj, refreshUser }: ProfileProps) => {
  const navigate = useNavigate();
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName || "");
  const [newPhotoURL, setNewPhotoURL] = useState(userObj.photoURL || "");
  const [uploadTask, setUploadTask] = useState<Promise<string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const onLogOutClick = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDisplayName(event.target.value);
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (files && files.length > 0) {
      const theFile = files[0];
      setIsProcessing(true);
      setUploadProgress(0);
      try {
        const { blob, preview } = await compressImage(theFile, 400, 400, 0.8);
        setNewPhotoURL(preview);
        
        const filePath = `${userObj.uid}/profile`;
        const task = (async () => {
          const { error } = await supabase.storage
            .from("momo_storage")
            .upload(filePath, blob, {
              upsert: true,
            });
          
          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from("momo_storage")
            .getPublicUrl(filePath);
          
          setUploadProgress(100);
          return publicUrl;
        })();

        // Catch the error early to prevent "Uncaught in promise"
        task.catch((err) => {
          console.error("Background upload failed:", err);
          setUploadProgress(null);
          setUploadTask(null);
          toast.error("Upload failed. Please check your connection or permissions.");
        });

        setUploadTask(task);
      } catch (error) {
        toast.error("Failed to process image.");
        setUploadProgress(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (updating || isProcessing) return;

    setUpdating(true);
    try {
      let photoURL = userObj.photoURL;

      if (uploadTask) {
        try {
          photoURL = await uploadTask;
        } catch (uploadError) {
          // If upload failed, don't proceed with profile update using old photoURL
          setUpdating(false);
          return;
        }
      }

      if (userObj.displayName !== newDisplayName || photoURL !== userObj.photoURL) {
        // OPTIMISTIC UI: Update the local state immediately
        // We manually trigger refresh with new data so the UI reflects changes instantly
        // even before the Firebase Auth update finishes.
        refreshUser(); 
        
        // This is the slow part (Firebase Auth update)
        await userObj.updateProfile({
          displayName: newDisplayName,
          photoURL,
        });
        
        toast.success("Profile updated!");
        setUploadTask(null);
        setUploadProgress(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl min-h-screen border-r border-gray-800 ml-20 md:ml-64 p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Profile</h2>
      </div>
      <div className="flex flex-col items-center space-y-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center text-4xl font-bold text-gray-400 overflow-hidden border-2 border-gray-700 relative">
            {newPhotoURL ? (
              <img src={newPhotoURL} alt="profile" className="w-full h-full object-cover" />
            ) : (
              newDisplayName[0] || "?"
            )}
            
            {/* Loading/Progress Overlay */}
            {(isProcessing || (uploadProgress !== null && uploadProgress < 100)) && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                {uploadProgress !== null && uploadProgress > 0 && (
                  <span className="text-white text-xs font-bold">{Math.round(uploadProgress)}%</span>
                )}
              </div>
            )}
          </div>
          <label
            htmlFor="profile-photo"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
          >
            <FontAwesomeIcon icon={faCamera} className="text-white text-2xl" />
          </label>
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            disabled={isProcessing || updating}
          />
        </div>

        <form onSubmit={onSubmit} className="w-full max-w-sm flex flex-col space-y-6">
          <div className="flex flex-col space-y-1">
            <label htmlFor="display-name" className="text-sm text-gray-500 ml-1">Display Name</label>
            <input
              id="display-name"
              name="displayName"
              onChange={onChange}
              type="text"
              placeholder="Display name"
              value={newDisplayName}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-lg"
            />
          </div>
          <input
            type="submit"
            disabled={updating || isProcessing || (uploadProgress !== null && uploadProgress < 100)}
            value={updating ? "Updating..." : (uploadProgress !== null && uploadProgress < 100) ? "Uploading Photo..." : isProcessing ? "Processing Image..." : "Update Profile"}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-full hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
          />
        </form>

        <button
          onClick={onLogOutClick}
          className="w-full max-w-sm bg-transparent border border-red-500/50 text-red-500 font-bold py-3 rounded-full hover:bg-red-500/10 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;

