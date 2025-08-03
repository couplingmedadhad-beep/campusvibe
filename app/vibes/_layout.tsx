import React from 'react';
import { Stack } from 'expo-router';

export default function VibesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="camera" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="viewer" />
    </Stack>
  );
}