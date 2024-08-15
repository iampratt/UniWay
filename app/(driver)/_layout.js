import { Stack } from 'expo-router';

export default layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='signup' />
      <Stack.Screen name='driverMain' />
    </Stack>
  );
};
