import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";
import { Camera, Mail, User, Users, MessageCircle, Sparkles } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState(null);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();

  // Fetch friends and groups data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch friends
        const friendsRes = await axiosInstance.get("/user/friends");
        console.log("Friends data:", friendsRes.data);
        setFriends(friendsRes.data.slice(0, 3));

        // Fetch groups
        const groupsRes = await axiosInstance.get("/group");
        console.log("Groups data:", groupsRes.data);
        setAllGroups(groupsRes.data);
        setGroups(groupsRes.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserData();
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "frontend_upload");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/doc4f27bu/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        await updateProfile({ profilePic: data.secure_url });
        setSelectedImg(data.secure_url);
        // ❌ REMOVED: toast.success("✅ Profile updated successfully!");
        // The toast is already shown by updateProfile in the store
      } else {
        throw new Error("Cloudinary upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("❌ Image upload failed. Please try again.");
    }
  };

  const handleFriendClick = (friend) => {
    setSelectedUser(friend);
    navigate("/");
  };

  const handleGroupClick = (group) => {
    setSelectedUser({
      _id: group._id,
      fullName: group.name,
      isGroup: true,
      members: group.members,
    });
    navigate("/");
  };

  if (!authUser) return null;

  const interests = authUser.interests || [];

  return (
    <div className="min-h-screen pt-16 px-4 bg-base-100 flex flex-col" data-theme={theme}>
      <div className="max-w-[80rem] w-full mx-auto pb-6 flex-1 flex flex-col">
        {/* Main Profile Card */}
        <div className="bg-base-100/60 backdrop-blur-3xl mt-4 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex-1 flex flex-col">
          {/* Header with Profile */}
          <div className="bg-gradient-to-br from-base-200/50 to-base-100/50 px-6 py-6 border-b border-white/5 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 rounded-full bg-primary/5 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full bg-secondary/5 blur-2xl"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group shrink-0">
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-base-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-500"
                  />
                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute bottom-1 right-1 
                    bg-primary hover:bg-primary-focus hover:scale-110
                    p-2 rounded-full cursor-pointer 
                    transition-all duration-300 shadow-lg
                    ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                  `}
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              
                <div className="flex-1 text-center md:text-left mt-2">
                  <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/60 mb-1">
                    {authUser.fullName}
                  </h1>
                  <p className="text-sm text-base-content/60 flex items-center gap-2 justify-center md:justify-start font-medium">
                    <div className="p-1 rounded-full bg-base-200/80 border border-white/5">
                      <Mail className="w-3 h-3 text-primary" />
                    </div>
                    {authUser.email}
                  </p>
                  {isUpdatingProfile && (
                    <p className="text-xs text-primary mt-2 font-medium">📸 Uploading new photo...</p>
                  )}
                </div>
              </div>

              {/* Stats on the right on desktop */}
              <div className="flex items-center gap-3 justify-center md:justify-end flex-wrap w-full md:w-auto">
                <div className="bg-base-200/50 backdrop-blur-md border border-white/5 rounded-xl py-2 px-4 shadow-sm flex flex-col items-center min-w-[80px]">
                  <div className="text-xl font-bold text-primary">{loading ? "..." : friends.length}</div>
                  <div className="text-[10px] font-semibold text-base-content/50 uppercase tracking-wider mt-0.5">Friends</div>
                </div>
                <div className="bg-base-200/50 backdrop-blur-md border border-white/5 rounded-xl py-2 px-4 shadow-sm flex flex-col items-center min-w-[80px]">
                  <div className="text-xl font-bold text-secondary">{loading ? "..." : allGroups.length}</div>
                  <div className="text-[10px] font-semibold text-base-content/50 uppercase tracking-wider mt-0.5">Groups</div>
                </div>
                <div className="bg-base-200/50 backdrop-blur-md border border-white/5 rounded-xl py-2 px-4 shadow-sm flex flex-col items-center min-w-[80px]">
                  <div className="text-xl font-bold text-accent">{interests.length}</div>
                  <div className="text-[10px] font-semibold text-base-content/50 uppercase tracking-wider mt-0.5">Interests</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid - 4 Columns */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                
              {/* Account Information Card */}
              <div className="bg-base-200/40 rounded-3xl p-5 border border-white/5 shadow-sm hover:shadow-md transition-shadow duration-300 h-full min-h-[16rem] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <User className="w-20 h-20" />
                </div>
                <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2 relative z-10">
                  <div className="p-1.5 bg-base-100 rounded-lg shadow-sm border border-white/5">
                    <User className="w-4 h-4 text-base-content/80" />
                  </div>
                  Account Info
                </h3>
                <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between py-2 border-b border-base-content/20">
                      <span className="text-base-content/80 font-medium text-sm">Member Since</span>
                      <span className="text-base-content font-semibold text-sm">
                        {new Date(authUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-base-content/20">
                      <span className="text-base-content/80 font-medium text-sm">Account Status</span>
                      <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-semibold">
                        ✅ Active
                      </span>
                    </div>
                  </div>
                </div>

              {/* Interests Section */}
              {interests.length > 0 ? (
                <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 hover:border-primary/20 hover:shadow-md transition-all duration-300 h-full min-h-[16rem] flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles className="w-20 h-20 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 relative z-10">
                    <div className="p-1.5 bg-base-100 rounded-lg shadow-sm border border-white/5">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    Interests
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full ml-auto font-semibold">
                      {interests.length}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5 flex-1 overflow-y-auto content-start relative z-10 pr-1 custom-scrollbar">
                    {interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-base-100 hover:bg-primary/10 text-primary/90 rounded-full font-medium border border-primary/20 hover:border-primary/40 shadow-sm transition-all duration-300 cursor-default text-xs hover:-translate-y-0.5"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-base-300/40 rounded-3xl p-5 border border-white/5 h-full min-h-[16rem] flex flex-col justify-center">
                  <h3 className="text-base font-bold text-base-content/70 mb-2">✨ Add Your Interests</h3>
                  <p className="text-base-content/60 text-xs">
                    Share your interests to connect with like-minded people!
                  </p>
                </div>
              )}

              {/* Top Friends Section */}
              {friends.length > 0 ? (
                <div className="bg-secondary/5 rounded-3xl p-5 border border-secondary/10 hover:border-secondary/20 hover:shadow-md transition-all duration-300 h-full min-h-[16rem] flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Users className="w-20 h-20 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2 relative z-10">
                    <div className="p-1.5 bg-base-100 rounded-lg shadow-sm border border-white/5">
                      <Users className="w-4 h-4 text-secondary" />
                    </div>
                    Friends
                    <span className="bg-secondary/10 text-secondary text-[10px] px-2 py-0.5 rounded-full ml-auto font-semibold">
                      {friends.length}
                    </span>
                  </h3>
                  <div className="space-y-2 overflow-y-auto flex-1 relative z-10 pr-1 custom-scrollbar">
                    {friends.map((friend) => (
                      <div 
                        key={friend._id} 
                        className="flex items-center gap-3 p-2 bg-base-100/60 hover:bg-base-100 rounded-xl border border-white/5 shadow-sm transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                        onClick={() => handleFriendClick(friend)}
                      >
                        <img
                          src={friend.profilePic || "/avatar.png"}
                          alt={friend.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-secondary/30 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-secondary truncate text-xs">{friend.fullName}</h4>
                          <p className="text-[10px] text-secondary/70">Click to chat</p>
                        </div>
                        <MessageCircle className="w-3 h-3 text-secondary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-base-300/40 rounded-3xl p-5 border border-white/5 h-full min-h-[16rem] flex flex-col justify-center">
                  <h3 className="text-base font-bold text-base-content/70 mb-2">👥 Make New Friends</h3>
                  <p className="text-base-content/60 text-xs">
                    Start chatting and making connections!
                  </p>
                </div>
              )}

              {/* Top Groups Section */}
              {groups.length > 0 ? (
                <div className="bg-accent/5 rounded-3xl p-5 border border-accent/10 hover:border-accent/20 hover:shadow-md transition-all duration-300 h-full min-h-[16rem] flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <MessageCircle className="w-20 h-20 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-accent mb-4 flex items-center gap-2 relative z-10">
                    <div className="p-1.5 bg-base-100 rounded-lg shadow-sm border border-white/5">
                      <MessageCircle className="w-4 h-4 text-accent" />
                    </div>
                    Groups
                    <span className="bg-accent/10 text-accent text-[10px] px-2 py-0.5 rounded-full ml-auto font-semibold">
                      {allGroups.length}
                    </span>
                  </h3>
                  <div className="space-y-2 overflow-y-auto flex-1 relative z-10 pr-1 custom-scrollbar">
                    {groups.map((group) => (
                      <div 
                        key={group._id} 
                        className="flex items-center gap-3 p-2 bg-base-100/60 hover:bg-base-100 rounded-xl border border-white/5 shadow-sm transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                        onClick={() => handleGroupClick(group)}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-accent/40 flex-shrink-0 overflow-hidden">
                          {group.profilePic ? (
                            <img 
                              src={group.profilePic} 
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-accent/30 flex items-center justify-center">
                              <Users className="w-4 h-4 text-accent" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-accent truncate text-xs">{group.name}</h4>
                          <p className="text-[10px] text-accent/70">
                            {group.members?.length || 0} members
                          </p>
                        </div>
                        <MessageCircle className="w-3 h-3 text-accent flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-base-300/40 rounded-3xl p-5 border border-white/5 h-full min-h-[16rem] flex flex-col justify-center">
                  <h3 className="text-base font-bold text-base-content/70 mb-2">🏘️ Join Groups</h3>
                  <p className="text-base-content/60 text-xs">
                    Create or join groups to chat with friends!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
