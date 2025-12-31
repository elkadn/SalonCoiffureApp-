import { getAllUsers, createUser, updateUser, deleteUser } from './userService';

export const getDashboardStats = async () => {
  try {
    const allUsers = await getAllUsers();
    
    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.actif !== false).length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      coiffeurs: allUsers.filter(u => u.role === 'coiffeur').length,
      clients: allUsers.filter(u => u.role === 'client').length,
      inactiveUsers: allUsers.filter(u => u.actif === false).length,
    };
    
    return stats;
  } catch (error) {
    console.error("Erreur récupération stats:", error);
    throw error;
  }
};

export const isUserAdmin = (user) => {
  return user && user.role === 'admin';
};

export const adminCreateUser = async (userData) => {
  if (!userData.role) {
    throw new Error('Le rôle est requis');
  }
  
  if (userData.role === 'admin') {
    console.log('Création d\'un nouvel administrateur');
  }
  
  return await createUser(userData);
};