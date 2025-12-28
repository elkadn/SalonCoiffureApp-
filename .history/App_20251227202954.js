export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initialisation APP');
        
        // NETTOYAGE COMPLET avant tout
        await AsyncStorage.clear();
        
        // Simple écouteur sans gestion d'erreur complexe
        const unsubscribe = onAuthStateChanged(
          auth,
          (firebaseUser) => {
            console.log('✅ Auth state updated:', !!firebaseUser);
            setUser(firebaseUser);
            setLoading(false);
          }
        );
        
        // Timeout de sécurité
        setTimeout(() => {
          if (loading) {
            console.log('⚠️ Timeout auth');
            setLoading(false);
          }
        }, 3000);
        
        return unsubscribe;
      } catch (err) {
        console.error('💥 App init error:', err);
        setError(err.message);
        setLoading(false);
        return () => {};
      }
    };
    
    initialize();
  }, []);

  // ÉCRAN DE TEST SIMPLE - sans tes composants complexes
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chargement...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // ÉCRAN DE LOGIN TRÈS SIMPLE pour tester
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Login Test</Text>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error || ''}</Text>
        
        <TouchableOpacity 
          style={{ 
            backgroundColor: 'blue', 
            padding: 15, 
            borderRadius: 5,
            marginBottom: 10 
          }}
          onPress={() => console.log('Test button')}
        >
          <Text style={{ color: 'white' }}>Bouton de test</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Si connecté, on teste un écran SIMPLE
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Connecté! Test réussi</Text>
      <TouchableOpacity 
        style={{ backgroundColor: 'red', padding: 15, marginTop: 20 }}
        onPress={async () => {
          await signOut(auth);
          setUser(null);
        }}
      >
        <Text style={{ color: 'white' }}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}