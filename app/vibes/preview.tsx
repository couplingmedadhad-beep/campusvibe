import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Dimensions, Alert, PanGestureHandler, State } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Type, Smile, MapPin, Music, Upload, Palette } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, runOnJS } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
}

interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

const textColors = ['#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
const stickers = ['😂', '❤️', '🔥', '👏', '🎉', '💯', '✨', '🙌', '😍', '🤔', '📚', '🎓', '☕', '🌟'];

export default function PreviewScreen() {
  const { mediaUri, mediaType } = useLocalSearchParams<{
    mediaUri: string;
    mediaType: 'photo' | 'video';
  }>();

  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickerOverlays, setStickerOverlays] = useState<StickerOverlay[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [isUploading, setIsUploading] = useState(false);

  const addTextOverlay = () => {
    if (currentText.trim()) {
      const newOverlay: TextOverlay = {
        id: Date.now().toString(),
        text: currentText,
        x: width / 2 - 50,
        y: height / 2 - 100,
        color: selectedColor,
        fontSize: 24,
        fontWeight: 'bold',
      };
      setTextOverlays([...textOverlays, newOverlay]);
      setCurrentText('');
      setShowTextInput(false);
    }
  };

  const addSticker = (emoji: string) => {
    const newSticker: StickerOverlay = {
      id: Date.now().toString(),
      emoji,
      x: width / 2 - 25,
      y: height / 2 - 100,
      size: 50,
    };
    setStickerOverlays([...stickerOverlays, newSticker]);
    setShowStickers(false);
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
  };

  const removeStickerOverlay = (id: string) => {
    setStickerOverlays(stickerOverlays.filter(overlay => overlay.id !== id));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Vibe Uploaded! 🎉',
        'Your vibe has been shared successfully and will be visible for 24 hours.',
        [
          {
            text: 'Awesome!',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const DraggableText = ({ overlay }: { overlay: TextOverlay }) => {
    const translateX = useSharedValue(overlay.x);
    const translateY = useSharedValue(overlay.y);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
        context.startY = translateY.value;
      },
      onActive: (event, context) => {
        translateX.value = context.startX + event.translationX;
        translateY.value = context.startY + event.translationY;
      },
      onEnd: () => {
        // Update the overlay position
        runOnJS(() => {
          setTextOverlays(prev =>
            prev.map(item =>
              item.id === overlay.id
                ? { ...item, x: translateX.value, y: translateY.value }
                : item
            )
          );
        })();
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }));

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.draggableText, animatedStyle]}>
          <TouchableOpacity
            onLongPress={() => removeTextOverlay(overlay.id)}
            style={styles.textOverlay}
          >
            <Text
              style={[
                styles.overlayText,
                {
                  color: overlay.color,
                  fontSize: overlay.fontSize,
                  fontWeight: overlay.fontWeight,
                },
              ]}
            >
              {overlay.text}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const DraggableSticker = ({ overlay }: { overlay: StickerOverlay }) => {
    const translateX = useSharedValue(overlay.x);
    const translateY = useSharedValue(overlay.y);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
        context.startY = translateY.value;
      },
      onActive: (event, context) => {
        translateX.value = context.startX + event.translationX;
        translateY.value = context.startY + event.translationY;
      },
      onEnd: () => {
        runOnJS(() => {
          setStickerOverlays(prev =>
            prev.map(item =>
              item.id === overlay.id
                ? { ...item, x: translateX.value, y: translateY.value }
                : item
            )
          );
        })();
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }));

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.draggableSticker, animatedStyle]}>
          <TouchableOpacity
            onLongPress={() => removeStickerOverlay(overlay.id)}
            style={styles.stickerOverlay}
          >
            <Text style={[styles.overlaySticker, { fontSize: overlay.size }]}>
              {overlay.emoji}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Media Preview */}
        <View style={styles.mediaContainer}>
          {mediaType === 'video' ? (
            <Video
              source={{ uri: mediaUri }}
              style={styles.media}
              shouldPlay
              isLooping
              resizeMode="cover"
            />
          ) : (
            <Image source={{ uri: mediaUri }} style={styles.media} />
          )}

          {/* Overlays */}
          {textOverlays.map(overlay => (
            <DraggableText key={overlay.id} overlay={overlay} />
          ))}

          {stickerOverlays.map(overlay => (
            <DraggableSticker key={overlay.id} overlay={overlay} />
          ))}
        </View>

        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.topButton} onPress={() => router.back()}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
              style={styles.topButtonGradient}
            >
              <X size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Side Tools */}
        <View style={styles.sideTools}>
          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => setShowTextInput(true)}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
              style={styles.toolGradient}
            >
              <Type size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => setShowStickers(true)}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
              style={styles.toolGradient}
            >
              <Smile size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
              style={styles.toolGradient}
            >
              <MapPin size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
              style={styles.toolGradient}
            >
              <Music size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Upload Button */}
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUpload}
            disabled={isUploading}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.uploadGradient}
            >
              <Upload size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.uploadText}>
                {isUploading ? 'Uploading...' : 'Share Vibe'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Text Input Modal */}
        {showTextInput && (
          <View style={styles.modalOverlay}>
            <View style={styles.textInputModal}>
              <Text style={styles.modalTitle}>Add Text</Text>
              
              <TextInput
                style={[styles.textInput, { color: selectedColor }]}
                placeholder="Type your text..."
                placeholderTextColor="#9CA3AF"
                value={currentText}
                onChangeText={setCurrentText}
                multiline
                autoFocus
              />

              <View style={styles.colorPicker}>
                {textColors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowTextInput(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={addTextOverlay}
                >
                  <Text style={[styles.modalButtonText, styles.primaryButtonText]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Stickers Modal */}
        {showStickers && (
          <View style={styles.modalOverlay}>
            <View style={styles.stickersModal}>
              <Text style={styles.modalTitle}>Add Sticker</Text>
              
              <View style={styles.stickersGrid}>
                {stickers.map(sticker => (
                  <TouchableOpacity
                    key={sticker}
                    style={styles.stickerOption}
                    onPress={() => addSticker(sticker)}
                  >
                    <Text style={styles.stickerEmoji}>{sticker}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowStickers(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mediaContainer: {
    flex: 1,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 20,
  },
  topButton: {
    // Styling handled by gradient
  },
  topButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideTools: {
    position: 'absolute',
    right: 24,
    top: '30%',
    zIndex: 20,
  },
  toolButton: {
    marginBottom: 16,
  },
  toolGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadContainer: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
    zIndex: 20,
  },
  uploadButton: {
    borderRadius: 25,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  draggableText: {
    position: 'absolute',
    zIndex: 15,
  },
  textOverlay: {
    padding: 8,
  },
  overlayText: {
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  draggableSticker: {
    position: 'absolute',
    zIndex: 15,
  },
  stickerOverlay: {
    padding: 8,
  },
  overlaySticker: {
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  textInputModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width - 48,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#6366F1',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: '#F3F4F6',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  stickersModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width - 48,
    maxWidth: 400,
    maxHeight: height * 0.6,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  stickerOption: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  stickerEmoji: {
    fontSize: 32,
  },
  modalCloseButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});