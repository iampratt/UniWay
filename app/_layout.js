import { Stack } from 'expo-router';

export default layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='(owner)' />
      <Stack.Screen name='(student)' />
    </Stack>
  );
};
