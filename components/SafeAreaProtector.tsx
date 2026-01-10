import { useThemeMode } from '@/hooks/useThemeMode'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
const SafeAreaProtector = ({children} : {children: React.ReactNode}) => {
  const { isDark } = useThemeMode();
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDark ? '#0B1220' : '#F9FAFB'}}>
      <StatusBar style='auto' />
      {children}
    </SafeAreaView>
  )
}

export default SafeAreaProtector

const styles = StyleSheet.create({})