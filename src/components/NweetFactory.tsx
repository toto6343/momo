import { useState } from "react";
import { supabase } from "fbase";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faImage } from "@fortawesome/free-solid-svg-icons";
import { UserObj } from "types";
import toast from "react-hot-toast";
import { compressImage } from "utils/imageUtils";

interface NweetFactoryProps {
  userObj: UserObj;
}

const NweetFactory = ({ userObj }: NweetFactoryProps) => {
  const [nweet, setNweet] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [uploadTask, setUploadTask] = useState<Promise<string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (nweet.trim() === "" || uploading || isProcessing) return;

    setUploading(true);
    try {
      let attachmentUrl = "";

      if (uploadTask) {
        attachmentUrl = await uploadTask;
      }

      const nweetObj = {
        text: nweet,
        createdAt: Date.now(),
        creatorId: userObj.uid,
        displayName: userObj.displayName,
        photoURL: userObj.photoURL,
        attachmentUrl,
      };

      const { error } = await supabase.from("momo").insert([nweetObj]);
      if (error) throw error;
      
      setNweet("");
      setAttachment(null);
      setUploadTask(null);
      setUploadProgress(null);
      toast.success("Moment shared!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to share moment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNweet(event.target.value);
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
        const { blob, preview } = await compressImage(theFile, 1200, 1200, 0.8);
        setAttachment(preview);
        
        const filePath = `${userObj.uid}/${uuidv4()}`;
        const task = (async () => {
          const { error } = await supabase.storage
            .from("momo_storage")
            .upload(filePath, blob, {
              cacheControl: "3600",
              upsert: false,
            });
          
          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from("momo_storage")
            .getPublicUrl(filePath);
          
          setUploadProgress(100);
          return publicUrl;
        })();
        
        setUploadTask(task);
      } catch (error) {
        toast.error("Failed to process image.");
        setUploadProgress(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const onClearAttachment = () => {
    setAttachment(null);
    setUploadTask(null);
    setUploadProgress(null);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {userObj.photoURL ? (
            <img src={userObj.photoURL} alt="profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 font-bold text-xl">{userObj.displayName?.[0] || "?"}</span>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="nweet-text" className="sr-only">Nweet text</label>
          <textarea
            id="nweet-text"
            name="text"
            value={nweet}
            onChange={onChange}
            placeholder="What's on your mind?"
            maxLength={280}
            className="w-full bg-transparent text-xl resize-none focus:outline-none placeholder-gray-500 pt-2"
            rows={2}
          />
        </div>
      </div>
      {attachment && (
        <div className="relative pl-16">
          <div className="relative inline-block">
            <img src={attachment} alt="preview" className="rounded-2xl max-h-80 w-auto border border-gray-800" />
            {uploadProgress !== null && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <div className="w-3/4 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-white text-xs font-bold">{Math.round(uploadProgress)}%</span>
              </div>
            )}
            <button
              onClick={onClearAttachment}
              type="button"
              className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-white" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pl-16 pt-2 border-t border-gray-800">
        <label htmlFor="attach-file" className="cursor-pointer text-purple-500 hover:bg-purple-500/10 p-2 rounded-full transition-colors flex items-center">
          <FontAwesomeIcon icon={faImage} size="lg" />
        </label>
        <input
          id="attach-file"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
        <input
          type="submit"
          value={uploading ? "Sharing..." : "Share"}
          disabled={nweet.trim() === "" || uploading || (uploadProgress !== null && uploadProgress < 100)}
          className="px-5 py-2 bg-purple-600 text-white font-bold rounded-full cursor-pointer hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </form>
  );
};

export default NweetFactory;

