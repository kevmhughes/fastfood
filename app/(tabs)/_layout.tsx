import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Slot } from 'expo-router'

export default function _Layout() {
const isAuthenticated = false; 
if(!isAuthenticated) return <Redirect href="/sign-in" />
// Replace with actual authentication logic
  return <Slot />
}

