import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { X, RotateCcw, Zap, ZapOff, Image as ImageIcon, Circle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to create vibes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => !current);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          router.push({
            pathname: '/vibes/preview',
            params: {
              mediaUri: photo.uri,
              mediaType: 'photo',
            },
          });
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30, // 30 seconds max like Instagram
        });
        
        if (video) {
          router.push({
            pathname: '/vibes/preview',
            params: {
              mediaUri: video.uri,
              mediaType: 'video',
            },
          });
        }
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('Error', 'Failed to record video');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        router.push({
          pathname: '/vibes/preview',
          params: {
            mediaUri: asset.uri,
            mediaType: asset.type === 'video' ? 'video' : 'photo',
          },
        });
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash ? 'on' : 'off'}
      >
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

          <View style={styles.topRightControls}>
            <TouchableOpacity style={styles.topButton} onPress={toggleFlash}>
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
                style={styles.topButtonGradient}
              >
                {flash ? (
                  <Zap size={24} color="#FFD700" strokeWidth={2} />
                ) : (
                  <ZapOff size={24} color="#FFFFFF" strokeWidth={2} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
                style={styles.topButtonGradient}
              >
                <RotateCcw size={24} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 0.9)']}
              style={styles.recordingGradient}
            >
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </LinearGradient>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
              style={styles.galleryGradient}
            >
              <ImageIcon size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={styles.captureButtonContainer}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            onPress={takePicture}
            activeOpacity={0.8}
          >
            <View style={[styles.captureButton, isRecording && styles.recordingButton]}>
              <LinearGradient
                colors={isRecording ? ['#EF4444', '#DC2626'] : ['#FFFFFF', '#F3F4F6']}
                style={styles.captureGradient}
              >
                {isRecording ? (
                  <View style={styles.recordingSquare} />
                ) : (
                  <Circle size={32} color="#1F2937" strokeWidth={3} />
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {/* Placeholder for symmetry */}
          <View style={styles.placeholder} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
            style={styles.instructionsGradient}
          >
            <Text style={styles.instructionsText}>
              Tap to capture • Hold to record
            </Text>
          </LinearGradient>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topButton: {
    marginLeft: 16,
  },
  topButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 120,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  recordingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  galleryButton: {
    width: 56,
    height: 56,
  },
  galleryGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    borderColor: '#EF4444',
  },
  captureGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingSquare: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  placeholder: {
    width: 56,
  },
  instructions: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionsGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  instructionsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});