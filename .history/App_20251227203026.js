import TestScreen from './src/screens/TestScreen';

export default function App() {
  // Commenter tout le reste et juste tester TestScreen
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Test" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}