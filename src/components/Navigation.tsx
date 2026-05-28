import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faUser, faHome } from "@fortawesome/free-solid-svg-icons";
import { UserObj } from "types";

interface NavigationProps {
  userObj: UserObj | null;
}

const Navigation = ({ userObj }: NavigationProps) => {
  return (
    <nav className="fixed left-0 top-0 h-full w-20 md:w-64 border-r border-gray-800 flex flex-col items-center md:items-start px-4 py-6 bg-black z-50">
      <ul className="flex flex-col space-y-4 w-full h-full">
        <li className="flex justify-center md:justify-start mb-4">
          <Link to="/" className="p-3 hover:bg-purple-500/10 rounded-full transition-colors">
            <FontAwesomeIcon icon={faComment} color={"#A855F7"} size="2x" />
          </Link>
        </li>
        <li className="flex justify-center md:justify-start">
          <Link
            to="/"
            className="flex items-center space-x-4 p-3 hover:bg-white/10 rounded-full transition-colors w-full group"
          >
            <FontAwesomeIcon icon={faHome} size="xl" />
            <span className="hidden md:inline text-xl font-medium">Home</span>
          </Link>
        </li>
        <li className="flex justify-center md:justify-start">
          <Link
            to="/profile"
            className="flex items-center space-x-4 p-3 hover:bg-white/10 rounded-full transition-colors w-full group"
          >
            {userObj?.photoURL ? (
              <img src={userObj.photoURL} alt="profile" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <FontAwesomeIcon icon={faUser} size="xl" />
            )}
            <span className="hidden md:inline text-xl font-medium">
              {userObj?.displayName ? userObj.displayName : "Profile"}
            </span>
          </Link>
        </li>
        <li className="mt-auto flex justify-center md:justify-start">
           <div className="flex items-center space-x-3 p-3 w-full">
             <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                {userObj?.photoURL ? (
                  <img src={userObj.photoURL} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 font-bold">{userObj?.displayName?.[0] || "?"}</span>
                )}
             </div>
             <div className="hidden md:flex flex-col">
                <span className="font-bold text-sm truncate max-w-[120px]">{userObj?.displayName || "User"}</span>
                <span className="text-gray-500 text-xs">@{userObj?.uid.slice(0, 8)}</span>
             </div>
           </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
