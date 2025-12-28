// Dans services/creneauService.js

// Fonctions simulées - à adapter selon votre backend
export const getStylisteCreneaux = async (stylisteId) => {
  // Simuler une API call
  return [
    { id: '1', stylisteId, jour: 'lundi', heureDebut: '09:00', heureFin: '12:00', actif: true },
    { id: '2', stylisteId, jour: 'lundi', heureDebut: '14:00', heureFin: '18:00', actif: true },
    { id: '3', stylisteId, jour: 'mardi', heureDebut: '09:00', heureFin: '17:00', actif: true },
  ];
};

export const addCreneau = async (creneauData) => {
  // Simuler une API call
  console.log('Ajout créneau:', creneauData);
  return { success: true, id: 'new-id' };
};

export const updateCreneau = async (creneauId, creneauData) => {
  // Simuler une API call
  console.log('Update créneau:', creneauId, creneauData);
  return { success: true };
};

export const deleteCreneau = async (creneauId) => {
  // Simuler une API call
  console.log('Delete créneau:', creneauId);
  return { success: true };
};