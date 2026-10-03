import { useState, useCallback } from "react";
import { View, ScrollView, Alert, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import useUpload from "@/utils/useUpload";
import { useProfileData } from "@/hooks/useProfileData";
import { useUserTips } from "@/hooks/useUserTips";
import { useUserTrips } from "@/hooks/useUserTrips";
import { useFollowCounts } from "@/hooks/useFollowCounts";
import { useProfileForm } from "@/hooks/useProfileForm";
import { useFriends } from "@/hooks/useFriends";
import { pickAndUploadProfileImage } from "@/utils/profileImagePicker";
import { LoadingView } from "@/components/Profile/LoadingView";
import { UnauthenticatedView } from "@/components/Profile/UnauthenticatedView";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { ProfilePicture } from "@/components/Profile/ProfilePicture";
import { ProfileEditForm } from "@/components/Profile/ProfileEditForm";
import { ProfileInfo } from "@/components/Profile/ProfileInfo";
import { FollowStats } from "@/components/Profile/FollowStats";
import { SocialLinksEdit } from "@/components/Profile/SocialLinksEdit";
import { SocialLinksDisplay } from "@/components/Profile/SocialLinksDisplay";
import { UpcomingTrips } from "@/components/Profile/UpcomingTrips";
import { UserTipsList } from "@/components/Profile/UserTipsList";
import { SignOutButton } from "@/components/Profile/SignOutButton";
import { FriendsSection } from "@/components/Profile/FriendsSection";
import { VacationCountdown } from "@/components/Profile/VacationCountdown";
import { TravelWalletSection } from "@/components/Profile/TravelWalletSection";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { auth, signIn, signOut, isReady } = useAuth();
  const [upload, { loading: uploading }] = useUpload();
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfileData(auth);

  const { data: userTipsData, isLoading: tipsLoading } = useUserTips(auth);
  const { data: tripsData, isLoading: tripsLoading } = useUserTrips(auth);
  const { followers, following } = useFollowCounts(auth);

  const {
    friends,
    pendingRequests,
    searchUsers,
    sendRequest,
    respondToRequest,
    unfriend,
  } = useFriends(auth);

  const {
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
    profileImageUrl,
    setProfileImageUrl,
    updateProfile,
    updateSocialLinks,
    createProfile,
  } = useProfileForm(profileData);

  const pickProfileImage = useCallback(async () => {
    await pickAndUploadProfileImage({
      upload,
      setProfileImageUrl,
      profileData,
      username,
      auth,
      refetchProfile,
    });
  }, [upload, profileData, username, auth, refetchProfile]);

  const handleSave = async () => {
    const profile = profileData?.profile;
    if (!profile) {
      try {
        await createProfile(auth);
      } catch (error) {
        return;
      }
    } else {
      await updateProfile();
      await updateSocialLinks();
    }
    setIsEditing(false);
    refetchProfile();
  };

  const handleSignOut = useCallback(async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  }, [signOut]);

  const handleSetCountdown = useCallback(
    async (tripId) => {
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_countdown_trip_id: tripId }),
        });
        refetchProfile();
      } catch (err) {
        console.error("Error setting countdown:", err);
      }
    },
    [refetchProfile],
  );

  const handleRemoveCountdown = useCallback(async () => {
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_countdown_trip_id: null }),
      });
      refetchProfile();
    } catch (err) {
      console.error("Error removing countdown:", err);
    }
  }, [refetchProfile]);

  if (!isReady) {
    return <LoadingView />;
  }

  if (!auth) {
    return <UnauthenticatedView insets={insets} onSignIn={signIn} />;
  }

  const profile = profileData?.profile;
  const userTips = userTipsData?.tips || [];
  const displayImage = profileImageUrl || profile?.profile_image;

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar style="light" />

      <ProfileHeader
        insets={insets}
        isEditing={isEditing}
        onToggleEdit={() => {
          if (isEditing) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {profileLoading ? (
          <LoadingView />
        ) : (
          <>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <ProfilePicture
                displayImage={displayImage}
                username={profile?.username}
                uploading={uploading}
                onPress={pickProfileImage}
              />

              {isEditing ? (
                <ProfileEditForm
                  username={username}
                  bio={bio}
                  onUsernameChange={setUsername}
                  onBioChange={setBio}
                />
              ) : (
                <ProfileInfo
                  username={profile?.username}
                  email={profile?.email || auth?.user?.email}
                  bio={profile?.bio}
                />
              )}
            </View>

            {/* Vacation Countdown */}
            <VacationCountdown
              profile={profile}
              onRemove={handleRemoveCountdown}
              trips={tripsData?.trips}
              onSetCountdown={handleSetCountdown}
            />

            <FollowStats
              friendsCount={friends.length}
              followersCount={followers.length}
              followingCount={following.length}
            />

            {/* Friends */}
            <FriendsSection
              friends={friends}
              pendingRequests={pendingRequests}
              onSearch={searchUsers}
              onSendRequest={(userId) => sendRequest.mutate(userId)}
              onAccept={(id) =>
                respondToRequest.mutate({ id, status: "accepted" })
              }
              onDecline={(id) =>
                respondToRequest.mutate({ id, status: "declined" })
              }
              onUnfriend={(userId) => unfriend.mutate(userId)}
            />

            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Social Media
              </Text>

              {isEditing ? (
                <SocialLinksEdit
                  facebookUrl={facebookUrl}
                  tiktokUrl={tiktokUrl}
                  twitterUrl={twitterUrl}
                  instagramUrl={instagramUrl}
                  onFacebookChange={setFacebookUrl}
                  onTiktokChange={setTiktokUrl}
                  onTwitterChange={setTwitterUrl}
                  onInstagramChange={setInstagramUrl}
                />
              ) : (
                <SocialLinksDisplay profile={profile} />
              )}
            </View>

            {/* ── Travel Wallet ── */}
            <TravelWalletSection auth={auth} />

            {auth && (
              <UpcomingTrips
                tripsData={tripsData}
                tripsLoading={tripsLoading}
              />
            )}

            <UserTipsList userTips={userTips} tipsLoading={tipsLoading} />

            <SignOutButton onSignOut={handleSignOut} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
