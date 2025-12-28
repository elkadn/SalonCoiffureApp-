import { createDefaultAdmin } from '../services/authService';

export const initializeAppData = async () => {
  console.log('Initialisation de l\'application...');
  
  try {
    // Créer l'admin par défaut
    await createDefaultAdmin();
    
    console.log('✅ Initialisation terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
};