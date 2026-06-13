import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const Sidebar = () => {
  const { selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers, authUser, friends, setFriends, socket } = useAuthStore();
  const isAdmin = authUser?.email === "bey@email.com";
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("friends"); // New state for tab switching

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        let res;
        if (isAdmin) {
          res = await axiosInstance.get("/user/all-users-except-admin");
        } else {
          res = await axiosInstance.get("/user/friends");
        }
        setFriends(res.data);
      } catch (error) {
        console.error("Failed to fetch friends", error);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await axiosInstance.get("/group");
        const userGroups = res.data.filter(group =>
          group.members.some(member => member._id === authUser._id)
        );
        setGroups(userGroups);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      }
    };

    fetchFriends();
    fetchGroups();
  }, [authUser?.friends, selectedUser]);

  // Socket listener for group profile updates
  useEffect(() => {
    if (!socket) return;

    const handleGroupProfileUpdate = (data) => {
      console.log("Group profile updated:", data);
      // Update the groups state with the new profile picture
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group._id === data.groupId 
            ? { ...group, profilePic: data.profilePic }
            : group
        )
      );
      
      // If this is the currently selected group, update it too
      if (selectedUser && selectedUser.groupId === data.groupId) {
        setSelectedUser({ ...selectedUser, profilePic: data.profilePic });
      }
    };

    socket.on("groupProfileUpdated", handleGroupProfileUpdate);

    return () => {
      socket.off("groupProfileUpdated", handleGroupProfileUpdate);
    };
  }, [socket, selectedUser, setSelectedUser]);

  const filteredUsers = (showOnlineOnly
    ? friends.filter((user) => onlineUsers.includes(user._id))
    : friends
  )
    .filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const openGroupChat = (group) => {
    console.log("Selected group from sidebar:", group);
    setSelectedUser({
      _id: group._id,
      fullName: group.name,
      groupId: group._id,
      isGroup: true,
      profilePic: "/group-avatar.png", // optional
      members: group.members,
    });
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-28 lg:w-96 bg-base-100/40 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="border-b border-white/5 w-full p-6 bg-gradient-to-b from-base-100/80 to-transparent">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Users className="size-6 text-primary" />
          </div>
          <span className="font-extrabold text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/60">
            Chats
          </span>
        </div>

        <div className="mt-2">
          <input
            type="text"
            placeholder={`Search ${activeTab === "friends" ? "Contacts" : "Groups"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full rounded-full bg-base-200/50 border border-white/5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-300 placeholder:text-base-content/40 px-5 shadow-inner"
          />
        </div>

        {/* Combined row with tab buttons and online filter toggle */}
        <div className="mt-4 flex items-center justify-between gap-2">
          {/* Tab Buttons */}
          <div className="flex gap-1 p-1 bg-base-200/50 rounded-full border border-white/5 w-fit">
            <button
              onClick={() => setActiveTab("friends")}
              className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "friends"
                  ? "bg-primary text-primary-content shadow-md scale-100"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-100/50 scale-95 hover:scale-100"
              }`}
            >
              <UserPlus className="size-4" />
              <span className="hidden lg:inline">Friends</span>
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "groups"
                  ? "bg-primary text-primary-content shadow-md scale-100"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-100/50 scale-95 hover:scale-100"
              }`}
            >
              <Users className="size-4" />
              <span className="hidden lg:inline">Groups</span>
            </button>
          </div>

          {/* Online filter toggle - only show for friends */}
          {activeTab === "friends" && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 border ${
                  showOnlineOnly
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                    : "bg-base-200/50 text-base-content/50 hover:bg-base-200 border-transparent"
                }`}
              >
                <span className="text-sm">online only</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto w-full py-4 px-2 flex-1">
        {activeTab === "friends" ? (
          <>
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full p-3 flex items-center gap-4 rounded-2xl transition-all duration-300 group hover:shadow-sm
                  ${selectedUser?._id === user._id 
                    ? "bg-gradient-to-r from-primary/20 to-primary/5 shadow-sm border border-primary/20" 
                    : "border border-transparent hover:bg-base-200/50"}
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-full ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3.5 bg-emerald-500 
                      rounded-full ring-2 ring-base-100 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"
                    />
                  )}
                </div>

                {/* User info - only visible on larger screens */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className={`truncate ${user.email === "bey@email.com" ? "font-bold" : "font-semibold"}`}>
                    {user.fullName}
                    {user.email === "bey@email.com" && " (Admin)"}
                  </div>
                  <div className="text-xs">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-4">
                {showOnlineOnly ? "No online friends" : "No friends yet"}
              </div>
            )}
          </>
        ) : (
          <>
            {groups
              .filter((group) =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((group) => (
                <button
                  key={group._id}
                  onClick={() => openGroupChat(group)}
                  className={`w-full text-left py-3 px-4 rounded-2xl flex items-center gap-4 transition-all duration-300 mb-2 group hover:shadow-sm
                    ${selectedUser?.groupId === group._id 
                      ? "bg-gradient-to-r from-primary/20 to-primary/5 shadow-sm border border-primary/20" 
                      : "border border-transparent hover:bg-base-200/50"}`}
                >
                  <div className="relative w-12 h-12">
                    <img
                      src={group.avatar || "/avatar.png"}
                      alt={group.name}
                      className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-white/10 group-hover:ring-primary/30 transition-all duration-300"
                    />
                    <div className="absolute bottom-0 right-0 rounded-full p-1 bg-base-100 shadow-sm border border-white/10">
                      <Users className="size-4" />
                    </div>
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="truncate font-semibold text-gray-800">{group.name}</div>
                    <div className="text-xs text-gray-500">
                      {group.members?.length || 0} members
                    </div>
                  </div>
                </button>
              ))}
            
            {groups.filter((group) =>
              group.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <div className="text-center text-zinc-500 py-4">
                {searchTerm ? "No groups found" : "No groups yet"}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
