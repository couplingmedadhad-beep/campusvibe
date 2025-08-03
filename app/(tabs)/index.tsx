import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MessageCircle, Heart, MessageSquare, Share, Bookmark, MoveHorizontal as MoreHorizontal, Play, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const vibes = [
  {
    id: 'your-vibe',
    username: 'Your Vibes',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isYourVibe: true,
  },
  {
    id: '1',
    username: 'Rahul',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    hasVibe: true,
    viewed: false,
  },
  {
    id: '2',
    username: 'Priya',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    hasVibe: true,
    viewed: true,
  },
  {
    id: '3',
    username: 'Arjun',
    avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    hasVibe: true,
    viewed: false,
  },
  {
    id: '4',
    username: 'Sneh',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    hasVibe: true,
    viewed: true,
  },
];

const posts = [
  {
    id: 1,
    username: 'rahul_memes',
    userImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    caption: 'When the professor says "This will be in the exam" 😂 #CollegeLife #Memes',
    likes: 1247,
    comments: 89,
    shares: 45,
    college: 'IIT Delhi',
    timeAgo: '2h',
    isLiked: false,
    isSaved: false,
    isVideo: false,
  }
];

export default function HomePage() {
  const [refreshing, setRefreshing] = useState(false);
  const [postsState, setPostsState] = useState(posts);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleLike = (postId: number) => {
    setPostsState(prev => prev.map(post =>
      post.id === postId
        ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
        : post
    ));
  };

  const toggleSave = (postId: number) => {
    setPostsState(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  const handleVibePress = (vibe: any) => {
    if (vibe.isYourVibe) {
      router.push('/vibes/camera');
    } else {
      router.push({
        pathname: '/vibes/viewer',
        params: { storyId: vibe.id, username: vibe.username },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logo}>CV</Text>
            </LinearGradient>
            <Text style={styles.logoText}>CampusVibe</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/events')}>
            <View style={styles.iconWrapper}>
              <Bell size={26} color="#1F2937" strokeWidth={2} />
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/messages')}>
            <View style={styles.iconWrapper}>
              <MessageCircle size={26} color="#1F2937" strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.scrollView}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingVertical: 10, paddingLeft: 16 }}
          contentContainerStyle={{ gap: 12 }}
        >
          {vibes.map((vibe) => (
            <TouchableOpacity
              key={vibe.id}
              style={{ alignItems: 'center', width: 80 }}
              onPress={() => handleVibePress(vibe)}
            >
              <View style={[{ width: 70, height: 70, borderRadius: 35, marginBottom: 6, position: 'relative' },
              vibe.isYourVibe && { borderWidth: 2, borderColor: '#E5E7EB' },
              vibe.hasVibe && !vibe.viewed && { borderWidth: 3, borderColor: '#6366F1' },
              vibe.hasVibe && vibe.viewed && { borderWidth: 3, borderColor: '#9CA3AF' }
              ]}>
                <Image source={{ uri: vibe.avatar }} style={{ width: '100%', height: '100%', borderRadius: 35 }} />
                {vibe.isYourVibe && (
                  <View style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' }}>
                    <Plus size={16} color="white" />
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 12, color: '#000', textAlign: 'center', fontWeight: '500' }}>
                {vibe.isYourVibe ? 'Your Vibe' : vibe.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Posts Feed */}
        <View style={styles.postsContainer}>
          {postsState.map((post) => (
            <View key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.postUserInfo}>
                  <Avatar
                    source={{ uri: post.userImage }}
                    size={36}
                    showOnlineStatus={true}
                    isOnline={Math.random() > 0.5}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.postUsername}>{post.username}</Text>
                    <View style={styles.postMeta}>
                      <Text style={styles.postCollege}>{post.college}</Text>
                      <View style={styles.timeDot} />
                      <Text style={styles.postTime}>{post.timeAgo}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                  <MoreHorizontal size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Post Image/Video */}
              <TouchableOpacity style={styles.postImageContainer} activeOpacity={0.95}>
                <Image source={{ uri: post.image }} style={styles.postImage} />
                {post.isVideo && (
                  <View style={styles.playButton}>
                    <LinearGradient
                      colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                      style={styles.playButtonGradient}
                    >
                      <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                    </LinearGradient>
                  </View>
                )}

                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.1)']}
                  style={styles.imageOverlay}
                />
              </TouchableOpacity>

              {/* Post Actions */}
              <View style={styles.postActions}>
                <View style={styles.leftActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleLike(post.id)}
                    activeOpacity={0.7}
                  >
                    <Heart
                      size={28}
                      color={post.isLiked ? "#EF4444" : "#1F2937"}
                      fill={post.isLiked ? "#EF4444" : "none"}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <MessageSquare size={28} color="#1F2937" strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <Share size={28} color="#1F2937" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => toggleSave(post.id)} activeOpacity={0.7}>
                  <Bookmark
                    size={28}
                    color={post.isSaved ? "#F59E0B" : "#1F2937"}
                    fill={post.isSaved ? "#F59E0B" : "none"}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>

              {/* Post Info */}
              <View style={styles.postInfo}>
                <Text style={styles.likesText}>
                  {post.likes.toLocaleString()} likes
                </Text>
                <View style={styles.captionContainer}>
                  <Text style={styles.captionText}>
                    <Text style={styles.usernameText}>{post.username}</Text>
                    <Text style={styles.captionContent}> {post.caption}</Text>
                  </Text>
                </View>
                {post.comments > 0 && (
                  <TouchableOpacity style={styles.viewComments} activeOpacity={0.7}>
                    <Text style={styles.viewCommentsText}>
                      View all {post.comments} comments
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logo: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
  iconWrapper: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  storiesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  storiesContainer: {
    paddingLeft: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 64,
  },
  storyImageContainer: {
    marginBottom: 6,
  },
  ownStoryContainer: {
    position: 'relative',
  },
  storyGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyImageWrapper: {
    width: 59,
    height: 59,
    borderRadius: 29.5,
    backgroundColor: '#FFFFFF',
    padding: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  addStoryIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyName: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  postsContainer: {
    backgroundColor: '#FFFFFF',
  },
  postCard: {
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 10,
    flex: 1,
  },
  postUsername: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  postCollege: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  timeDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 6,
  },
  postTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  moreButton: {
    padding: 6,
  },
  postImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
    padding: 2,
  },
  postInfo: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  likesText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 6,
  },
  captionContainer: {
    marginBottom: 6,
  },
  captionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 20,
  },
  usernameText: {
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  captionContent: {
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  viewComments: {
    marginTop: 2,
  },
  viewCommentsText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 16,
  },
});