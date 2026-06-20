import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  MessageSquare,
  Search,
  User,
  Users,
  UsersRound,
  Wifi,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";

const Sidebar = () => {
  const { selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser, friends, setFriends, socket } = useAuthStore();
  const isAdmin = authUser?.email === "bey@email.com";
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = isAdmin
          ? await axiosInstance.get("/user/all-users-except-admin")
          : await axiosInstance.get("/user/friends");
        setFriends(res.data);
      } catch (error) {
        console.error("Failed to fetch friends", error);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await axiosInstance.get("/group");
        const userGroups = res.data.filter((group) =>
          group.members.some((member) => member._id === authUser._id)
        );
        setGroups(userGroups);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      }
    };

    fetchFriends();
    fetchGroups();
  }, [authUser?.friends, selectedUser, authUser?._id, isAdmin, setFriends]);

  useEffect(() => {
    if (!socket) return;

    const handleGroupProfileUpdate = (data) => {
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === data.groupId ? { ...group, profilePic: data.profilePic } : group
        )
      );

      if (selectedUser && selectedUser.groupId === data.groupId) {
        setSelectedUser({ ...selectedUser, profilePic: data.profilePic });
      }
    };

    socket.on("groupProfileUpdated", handleGroupProfileUpdate);
    return () => socket.off("groupProfileUpdated", handleGroupProfileUpdate);
  }, [socket, selectedUser, setSelectedUser]);

  const filteredUsers = (showOnlineOnly
    ? friends.filter((user) => onlineUsers.includes(user._id))
    : friends
  )
    .filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineCount = friends.filter((user) => onlineUsers.includes(user._id)).length;

  const openGroupChat = (group) => {
    setSelectedUser({
      _id: group._id,
      fullName: group.name,
      groupId: group._id,
      isGroup: true,
      profilePic: group.profilePic || group.avatar || "/group-avatar.png",
      members: group.members,
    });
  };

  const isSelected = (id) => selectedUser?._id === id || selectedUser?.groupId === id;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 sm:w-24 lg:w-80 xl:w-96 bg-base-100/60 backdrop-blur-2xl border-r border-white/10 flex flex-col shadow-[4px_0_32px_rgba(0,0,0,0.04)] z-10">
      {/* Header */}
      <div className="hidden lg:flex shrink-0 p-5 border-b border-white/10 bg-gradient-to-b from-base-100/90 to-transparent flex-col space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/25 transition-transform duration-300 hover:scale-105">
              <MessageSquare className="w-5 h-5 text-primary-content" />
            </div>
            {onlineCount > 0 && activeTab === "friends" && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-base-100"></span>
              </span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight tracking-tight text-base-content">
              Messages
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {activeTab === "friends" ? (
                <>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {onlineCount} Online
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-base-content/5 text-base-content/70 border border-base-content/10 shadow-sm">
                    {friends.length} Contacts
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                  <Users className="w-3 h-3" />
                  {groups.length} Groups
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={activeTab === "friends" ? "Search contacts..." : "Search groups..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-base-200/60 border border-white/10 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-base-content/35 shadow-inner"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 p-1 rounded-xl bg-base-200/60 border border-white/10">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                activeTab === "friends"
                  ? "bg-base-100 text-primary shadow-sm"
                  : "text-base-content/55 hover:text-base-content"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Friends</span>
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                activeTab === "groups"
                  ? "bg-base-100 text-primary shadow-sm"
                  : "text-base-content/55 hover:text-base-content"
              }`}
            >
              <UsersRound className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Groups</span>
            </button>
          </div>

          {activeTab === "friends" && (
            <button
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              title="Show online only"
              className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                showOnlineOnly
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                  : "bg-base-200/60 text-base-content/45 border-white/10 hover:text-base-content"
              }`}
            >
              <Wifi className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 lg:p-3 space-y-1">
        {activeTab === "friends" ? (
          <>
            {filteredUsers.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              const selected = isSelected(user._id);

              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-2 lg:p-3 flex items-center gap-3 rounded-2xl transition-all duration-200 group ${
                    selected
                      ? "bg-primary/10 border border-primary/25 shadow-sm"
                      : "border border-transparent hover:bg-base-200/60"
                  }`}
                >
                  <div className="relative shrink-0 mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className={`size-11 lg:size-12 object-cover rounded-full transition-all ${
                        selected ? "ring-2 ring-primary/50" : "ring-2 ring-transparent group-hover:ring-base-content/10"
                      }`}
                    />
                    {isOnline && (
                      <span className="absolute bottom-0.5 right-0.5 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100" />
                    )}
                  </div>

                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <p className={`truncate text-sm ${user.email === "bey@email.com" ? "font-bold" : "font-semibold"}`}>
                      {user.fullName}
                      {user.email === "bey@email.com" && (
                        <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">Admin</span>
                      )}
                    </p>
                    <p className={`text-xs mt-0.5 ${isOnline ? "text-emerald-500 font-medium" : "text-base-content/45"}`}>
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-base-200/80 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-base-content/30" />
                </div>
                <p className="text-sm font-medium text-base-content/60">
                  {showOnlineOnly ? "No friends online" : "No contacts found"}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {filteredGroups.map((group) => {
              const selected = isSelected(group._id);

              return (
                <button
                  key={group._id}
                  onClick={() => openGroupChat(group)}
                  className={`w-full p-2 lg:p-3 flex items-center gap-3 rounded-2xl transition-all duration-200 group ${
                    selected
                      ? "bg-primary/10 border border-primary/25 shadow-sm"
                      : "border border-transparent hover:bg-base-200/60"
                  }`}
                >
                  <div className="relative shrink-0 mx-auto lg:mx-0">
                    <img
                      src={group.profilePic || group.avatar || "/group-avatar.png"}
                      alt={group.name}
                      className={`size-11 lg:size-12 object-cover rounded-2xl transition-all ${
                        selected ? "ring-2 ring-primary/50" : "ring-2 ring-transparent group-hover:ring-base-content/10"
                      }`}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-base-100 border border-white/10 flex items-center justify-center shadow-sm">
                      <UsersRound className="w-3 h-3 text-primary" />
                    </div>
                  </div>

                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{group.name}</p>
                    <p className="text-xs text-base-content/45 mt-0.5">
                      {group.members?.length || 0} members
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-base-200/80 flex items-center justify-center mb-3">
                  <UsersRound className="w-6 h-6 text-base-content/30" />
                </div>
                <p className="text-sm font-medium text-base-content/60">
                  {searchTerm ? "No groups found" : "No groups yet"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
