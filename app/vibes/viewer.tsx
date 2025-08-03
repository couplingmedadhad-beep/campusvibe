import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Heart, Send, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface Story {
  id: string;
  username: string;
  avatar: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  timestamp: Date;
  viewed: boolean;
}

const mockStories: Story[] = [
  {
    id: '1',
    username: 'Rahul',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    mediaUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    mediaType: 'photo',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    viewed: false,
  },
  {
    id: '2',
    username: 'Rahul',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    mediaUrl: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400',
    mediaType: 'photo',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    viewed: false,
  },
  {
    id: '3',
    username: 'Priya',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    mediaUrl: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
    mediaType: 'photo',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    viewed: true,
  },
  {
    id: '4',
    username: 'Arjun',
    avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150',
    mediaUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    mediaType: 'photo',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    viewed: false,
  },
];

export default function VibesViewerScreen() {
  const { storyId, username } = useLocalSearchParams<{
    storyId: string;
    username: string;
  }>();

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  // Group stories by user
  const userStories = mockStories.filter(story => story.username === username);
  const currentStory = userStories[currentSegmentIndex];

  useEffect(() => {
    setStories(userStories);
    startProgress();
    return () => {
      if (progressTimer.current) {
        clearTimeout(progressTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      startProgress();
    } else {
      pauseProgress();
    }
  }, [currentSegmentIndex, isPaused]);

  const startProgress = () => {
    progressAnimation.setValue(0);
    
    if (!isPaused) {
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 5000, // 5 seconds per story
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && !isPaused) {
          nextStory();
        }
      });
    }
  };

  const pauseProgress = () => {
    progressAnimation.stopAnimation();
  };

  const nextStory = () => {
    if (currentSegmentIndex < userStories.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
    } else {
      // Move to next user's stories or close
      router.back();
    }
  };

  const previousStory = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
    } else {
      router.back();
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 50;
    },
    onPanResponderMove: (_, gestureState) => {
      // Handle swipe gestures
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        // Swipe right - previous story
        previousStory();
      } else if (gestureState.dx < -50) {
        // Swipe left - next story
        nextStory();
      }
    },
  });

  const handleTap = (event: any) => {
    const tapX = event.nativeEvent.locationX;
    const screenWidth = width;
    
    if (tapX < screenWidth / 2) {
      previousStory();
    } else {
      nextStory();
    }
  };

  const handleLongPress = () => {
    setIsPaused(true);
  };

  const handlePressOut = () => {
    setIsPaused(false);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (!currentStory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Story not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.errorButton}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.storyContainer} {...panResponder.panHandlers}>
        {/* Story Media */}
        <TouchableOpacity
          style={styles.mediaContainer}
          activeOpacity={1}
          onPress={handleTap}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
        >
          {currentStory.mediaType === 'video' ? (
            <Video
              source={{ uri: currentStory.mediaUrl }}
              style={styles.media}
              shouldPlay={!isPaused}
              isLooping={false}
              resizeMode="cover"
            />
          ) : (
            <Image source={{ uri: currentStory.mediaUrl }} style={styles.media} />
          )}

          {/* Gradient Overlays */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.3)']}
            style={styles.topGradient}
            locations={[0, 0.3, 1]}
          />
        </TouchableOpacity>

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {userStories.map((_, index) => (
            <View key={index} style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground} />
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: index === currentSegmentIndex
                      ? progressAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : index < currentSegmentIndex ? '100%' : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={{ uri: currentStory.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{currentStory.username}</Text>
              <Text style={styles.timestamp}>
                {formatTimeAgo(currentStory.timestamp)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <MoreHorizontal size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <X size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <View style={styles.reactionContainer}>
            <TouchableOpacity
              style={styles.reactionButton}
              onPress={() => setIsLiked(!isLiked)}
            >
              <LinearGradient
                colors={isLiked ? ['#FF6B6B', '#FF8E53'] : ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.3)']}
                style={styles.reactionGradient}
              >
                <Heart
                  size={24}
                  color="#FFFFFF"
                  fill={isLiked ? "#FFFFFF" : "none"}
                  strokeWidth={2}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reactionButton}>
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.3)']}
                style={styles.reactionGradient}
              >
                <Send size={24} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pause Indicator */}
        {isPaused && (
          <View style={styles.pauseIndicator}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
              style={styles.pauseGradient}
            >
              <Text style={styles.pauseText}>Paused</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  errorButton: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
  },
  storyContainer: {
    flex: 1,
    position: 'relative',
  },
  mediaContainer: {
    flex: 1,
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    zIndex: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    marginHorizontal: 1,
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  header: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  reactionButton: {
    marginLeft: 16,
  },
  reactionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -20 }],
    zIndex: 20,
  },
  pauseGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  pauseText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});