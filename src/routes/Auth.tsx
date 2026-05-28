import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "fbase";
import AuthForm from "components/AuthForm";
import toast from "react-hot-toast";

const Auth = () => {
  const onSocialClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const {
      currentTarget: { name },
    } = event;
    
    try {
      if (name === "google") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
        });
        if (error) throw error;
      } else if (name === "github") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
        });
        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-12 bg-black px-4">
      <div className="flex flex-col items-center space-y-4">
        <FontAwesomeIcon
          icon={faComment}
          color={"#A855F7"}
          size="4x"
        />
        <h1 className="text-4xl font-black tracking-tight">Momo</h1>
        <p className="text-xl text-gray-400">Capture your moments.</p>
      </div>
      <div className="w-full max-w-[350px] space-y-6">
        <AuthForm />
        <div className="flex flex-col space-y-3 pt-6 border-t border-gray-800">
          <button
            onClick={onSocialClick}
            name="google"
            className="flex items-center justify-center space-x-3 px-4 py-3 text-base font-bold text-white transition-colors bg-white/5 border border-gray-700 rounded-full hover:bg-white/10"
          >
            <FontAwesomeIcon icon={faGoogle} />
            <span>Continue with Google</span>
          </button>
          <button
            onClick={onSocialClick}
            name="github"
            className="flex items-center justify-center space-x-3 px-4 py-3 text-base font-bold text-white transition-colors bg-white/5 border border-gray-700 rounded-full hover:bg-white/10"
          >
            <FontAwesomeIcon icon={faGithub} />
            <span>Continue with Github</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Auth;
