"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import useAuth from "@/utils/useAuth";
import useUpload from "@/utils/useUpload";
import { useProfileData } from "@/hooks/useProfileData";
import { useFriends } from "@/hooks/useFriends";
import { useFriendSearch } from "@/hooks/useFriendSearch";
import { useProfileForm } from "@/hooks/useProfileForm";
import { useProfileImage } from "@/hooks/useProfileImage";
import { LoadingView } from "@/components/Profile/LoadingView";
import { UnauthenticatedView } from "@/components/Profile/UnauthenticatedView";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { ProfilePicture } from "@/components/Profile/ProfilePicture";
import { ProfileInfo } from "@/components/Profile/ProfileInfo";
import { ProfileEditForm } from "@/components/Profile/ProfileEditForm";
import { FollowStats } from "@/components/Profile/FollowStats";
import { SocialLinksDisplay } from "@/components/Profile/SocialLinksDisplay";
import { SocialLinksEdit } from "@/components/Profile/SocialLinksEdit";
import { VacationCountdown } from "@/components/Profile/VacationCountdown";
import { FriendSearch } from "@/components/Profile/FriendSearch";
import { FriendsSection } from "@/components/Profile/FriendsSection";
import { UpcomingTrips } from "@/components/Profile/UpcomingTrips";
import { UserTipsList } from "@/components/Profile/UserTipsList";
import { SignOutButton } from "@/components/Profile/SignOutButton";
import {
  getCountdown,
  getUpcomingTrips,
  getCountdownTrip,
  renderAvatar,
} from "@/utils/profileHelpers";

export default function ProfilePage() {
  const { data: user } = useUser();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

  const { profile, userTips, trips, followers, following, loading, refetch } =
    useProfileData(user);

  const {
    isEditing,
    setIsEditing,
    username,
    setUsername,
    bio,
    setBio,
    facebookUrl,
    setFacebookUrl,
    tiktokUrl,
    setTiktokUrl,
    twitterUrl,
    setTwitterUrl,
    instagramUrl,
    setInstagramUrl,
    handleSave,
  } = useProfileForm(profile, refetch);

  const { profileImageUrl, handleImageUpload } = useProfileImage(
    profile,
    user,
    upload,
    refetch,
  );

  const {
    friends,
    pendingRequests,
    sendRequest,
    respondToRequest,
    unfriend,
    isSendingRequest,
  } = useFriends(user);

  const { searchResults } = useFriendSearch(user, friendSearchQuery);

  const setCountdownMutation = useMutation({
    mutationFn: async (tripId) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_countdown_trip_id: tripId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => refetch(),
  });

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) signOut();
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const countdownTrip = getCountdownTrip(profile);
  const countdown = countdownTrip
    ? getCountdown(countdownTrip.start_date)
    : null;
  const upcomingTrips = getUpcomingTrips(trips);
  const displayImage = profileImageUrl || profile?.profile_image;

  if (loading) {
    return <LoadingView />;
  }

  if (!user) {
    return <UnauthenticatedView />;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-24 md:pb-8">
      <ProfileHeader isEditing={isEditing} onToggleEdit={handleToggleEdit} />

      <div className="max-w-2xl mx-auto px-5 md:px-8 -mt-16 space-y-5">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <ProfilePicture
              displayImage={displayImage}
              username={profile?.username}
              uploading={uploading}
              onImageClick={() => fileInputRef.current?.click()}
            />

            {isEditing ? (
              <ProfileEditForm
                username={username}
                setUsername={setUsername}
                bio={bio}
                setBio={setBio}
              />
            ) : (
              <ProfileInfo profile={profile} email={user?.email} />
            )}
          </div>

          <FollowStats
            friends={friends.length}
            followers={followers.length}
            following={following.length}
            tips={userTips.length}
          />

          {!isEditing && <SocialLinksDisplay profile={profile} />}

          {isEditing && (
            <SocialLinksEdit
              facebookUrl={facebookUrl}
              setFacebookUrl={setFacebookUrl}
              twitterUrl={twitterUrl}
              setTwitterUrl={setTwitterUrl}
              instagramUrl={instagramUrl}
              setInstagramUrl={setInstagramUrl}
              tiktokUrl={tiktokUrl}
              setTiktokUrl={setTiktokUrl}
            />
          )}
        </div>

        <VacationCountdown
          trip={countdownTrip}
          countdown={countdown}
          onRemove={() => setCountdownMutation.mutate(null)}
        />

        {/* Upcoming Trips — full width for expanded panels */}
        <UpcomingTrips
          trips={upcomingTrips}
          activeCountdownId={profile?.display_countdown_trip_id}
          onSetCountdown={(tripId) => setCountdownMutation.mutate(tripId)}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* LEFT: Find Friends + Friends List */}
          <div className="space-y-5">
            <FriendSearch
              searchQuery={friendSearchQuery}
              setSearchQuery={setFriendSearchQuery}
              searchResults={searchResults}
              onSendRequest={sendRequest}
              isSending={isSendingRequest}
              renderAvatar={renderAvatar}
              searchInputRef={searchInputRef}
            />

            <FriendsSection
              friends={friends}
              pendingRequests={pendingRequests}
              onUnfriend={unfriend}
              onRespondToRequest={respondToRequest}
              renderAvatar={renderAvatar}
            />
          </div>

          {/* RIGHT: Tips */}
          <div className="space-y-5">
            <UserTipsList tips={userTips} />
          </div>
        </div>

        <SignOutButton onSignOut={handleSignOut} />
      </div>

      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
