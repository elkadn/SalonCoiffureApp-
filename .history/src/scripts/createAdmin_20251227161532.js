// src/scripts/createAdmin.js
import { auth, db } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const createDefaultAdmin = async () => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@salon.com',
      'Admin123!' // Changez ce mot de passe en production
    );

    // Ajouter les informations dans Firestore
    await setDoc(doc(db, "admins", userCredential.user.uid), {
      email: 'admin@salon.com',
      nom: 'Admin',
      prenom: 'Principal',
      telephone: '0612345678',
      role: 'admin',
      dateCreation: new Date(),
      actif: true
    });

    console.log('Admin créé avec succès!');
    console.log('Email: admin@salon.com');
    console.log('Mot de passe: Admin123!');
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
  }
};

export default createDefaultAdmin;