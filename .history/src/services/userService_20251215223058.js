import firestore from '@react-native-firebase/firestore';

export const addUser = async (userData) => {
  try {
    const docRef = await firestore().collection('users').add({
      ...userData,
      dateAjout: firestore.FieldValue.serverTimestamp(), // Syntaxe changée
      actif: true
    });
    console.log("Utilisateur ajouté avec ID :", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", e);
    throw e;
  }
};