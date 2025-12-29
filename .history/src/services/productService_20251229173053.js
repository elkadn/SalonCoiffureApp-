// services/productService.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// ============ CATÉGORIES ============
const CATEGORIES_COLLECTION = "categories";
const PRODUCTS_COLLECTION = "products";
const SUPPLIERS_COLLECTION = "suppliers";

// === CATÉGORIES ===
export const getAllCategories = async () => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(categoriesRef, orderBy("nom"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération catégories:", error);
    throw error;
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
    
    if (categoryDoc.exists()) {
      return {
        id: categoryDoc.id,
        ...categoryDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération catégorie:", error);
    throw error;
  }
};

// export const createCategory = async (categoryData) => {
//   try {
//     // Vérifier si la catégorie existe déjà
//     const isUnique = await checkUniqueCategoryName(categoryData.nom);
//     if (!isUnique) {
//       throw new Error("Cette catégorie existe déjà");
//     }

//     const categoryDoc = {
//       nom: categoryData.nom.trim(),
//       description: categoryData.description?.trim() || "",
//       dateCreation: serverTimestamp(),
//       dateModification: serverTimestamp(),
//       actif: true,
//       nombreProduits: 0
//     };

//     const newDocRef = doc(collection(db, CATEGORIES_COLLECTION));
//     await setDoc(newDocRef, categoryDoc);
    
//     return {
//       id: newDocRef.id,
//       ...categoryDoc
//     };
//   } catch (error) {
//     console.error("Erreur création catégorie:", error);
//     throw error;
//   }
// };

// export const updateCategory = async (categoryId, categoryData) => {
//   try {
//     // Vérifier si le nom est unique
//     const isUnique = await checkUniqueCategoryName(categoryData.nom, categoryId);
//     if (!isUnique) {
//       throw new Error("Cette catégorie existe déjà");
//     }

//     const dataToUpdate = {
//       nom: categoryData.nom.trim(),
//       description: categoryData.description?.trim() || "",
//       dateModification: serverTimestamp()
//     };

//     await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), dataToUpdate);
//     return await getCategoryById(categoryId);
//   } catch (error) {
//     console.error("Erreur mise à jour catégorie:", error);
//     throw error;
//   }
// };

export const deleteCategory = async (categoryId) => {
  try {
    // Vérifier si la catégorie a des produits
    const products = await getProductsByCategory(categoryId);
    if (products.length > 0) {
      throw new Error("Impossible de supprimer : cette catégorie contient des produits");
    }

    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
    return categoryId;
  } catch (error) {
    console.error("Erreur suppression catégorie:", error);
    throw error;
  }
};

// export const checkUniqueCategoryName = async (nom, excludeId = null) => {
//   try {
//     const categoriesRef = collection(db, CATEGORIES_COLLECTION);
//     const nomLower = nom.trim().toLowerCase();
    
//     const q = query(
//       categoriesRef,
//       where("nom", ">=", nomLower),
//       where("nom", "<=", nomLower + "\uf8ff")
//     );
    
//     const snapshot = await getDocs(q);
    
//     const existingCategories = snapshot.docs
//       .filter(doc => excludeId ? doc.id !== excludeId : true)
//       .filter(doc => {
//         const data = doc.data();
//         return data.actif !== false && 
//                data.nom.toLowerCase() === nomLower;
//       });
    
//     return existingCategories.length === 0;
//   } catch (error) {
//     console.error("Erreur vérification nom catégorie:", error);
//     throw error;
//   }
// };

// === FOURNISSEURS ===
export const getAllSuppliers = async () => {
  try {
    const suppliersRef = collection(db, SUPPLIERS_COLLECTION);
    const q = query(suppliersRef, orderBy("nom"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération fournisseurs:", error);
    throw error;
  }
};

export const createSupplier = async (supplierData) => {
  try {
    // Vérifier si le fournisseur existe déjà
    const exists = await checkSupplierExists(supplierData.nom, supplierData.email);
    if (exists) {
      throw new Error("Ce fournisseur existe déjà");
    }

    const supplierDoc = {
      nom: supplierData.nom.trim(),
      email: supplierData.email.trim(),
      telephone: supplierData.telephone?.trim() || "",
      adresse: supplierData.adresse?.trim() || "",
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
      actif: true,
      nombreProduits: 0
    };

    const newDocRef = doc(collection(db, SUPPLIERS_COLLECTION));
    await setDoc(newDocRef, supplierDoc);
    
    return {
      id: newDocRef.id,
      ...supplierDoc
    };
  } catch (error) {
    console.error("Erreur création fournisseur:", error);
    throw error;
  }
};

export const checkSupplierExists = async (nom, email) => {
  try {
    const suppliersRef = collection(db, SUPPLIERS_COLLECTION);
    const q = query(
      suppliersRef,
      where("nom", "==", nom.trim())
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return true;
    
    // Vérifier aussi par email
    const q2 = query(
      suppliersRef,
      where("email", "==", email.trim())
    );
    
    const snapshot2 = await getDocs(q2);
    return !snapshot2.empty;
  } catch (error) {
    console.error("Erreur vérification fournisseur:", error);
    throw error;
  }
};

export const getSupplierById = async (supplierId) => {
  try {
    const supplierDoc = await getDoc(doc(db, SUPPLIERS_COLLECTION, supplierId));
    
    if (supplierDoc.exists()) {
      return {
        id: supplierDoc.id,
        ...supplierDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération fournisseur:", error);
    throw error;
  }
};

// Mettre à jour un fournisseur
export const updateSupplier = async (supplierId, supplierData) => {
  try {
    // Vérifier si le nom/email sont uniques (sauf pour l'actuel)
    const supplier = await getSupplierById(supplierId);
    if (!supplier) {
      throw new Error("Fournisseur non trouvé");
    }

    // Vérifier si le nom a changé
    if (supplierData.nom !== supplier.nom) {
      const exists = await checkSupplierExists(supplierData.nom, "");
      if (exists) {
        throw new Error("Un fournisseur avec ce nom existe déjà");
      }
    }

    // Vérifier si l'email a changé
    if (supplierData.email !== supplier.email) {
      const exists = await checkSupplierExists("", supplierData.email);
      if (exists) {
        throw new Error("Un fournisseur avec cet email existe déjà");
      }
    }

    const dataToUpdate = {
      nom: supplierData.nom.trim(),
      email: supplierData.email.trim(),
      telephone: supplierData.telephone?.trim() || "",
      adresse: supplierData.adresse?.trim() || "",
      notes: supplierData.notes?.trim() || "",
      dateModification: serverTimestamp()
    };

    await updateDoc(doc(db, SUPPLIERS_COLLECTION, supplierId), dataToUpdate);
    return await getSupplierById(supplierId);
  } catch (error) {
    console.error("Erreur mise à jour fournisseur:", error);
    throw error;
  }
};

// Supprimer un fournisseur
export const deleteSupplier = async (supplierId) => {
  try {
    // Vérifier si le fournisseur a des produits
    // Vous devrez peut-être créer getProductsBySupplier
    // Pour l'instant, on supprime sans vérification
    await deleteDoc(doc(db, SUPPLIERS_COLLECTION, supplierId));
    console.log("Fournisseur supprimé :", supplierId);
    return supplierId;
  } catch (error) {
    console.error("Erreur suppression fournisseur:", error);
    throw error;
  }
};

// === PRODUITS ===
export const createProduct = async (productData) => {
  try {
    // Vérifier si le code produit est unique
    if (productData.code) {
      const exists = await checkProductCodeExists(productData.code);
      if (exists) {
        throw new Error("Ce code produit existe déjà");
      }
    }

    const productDoc = {
      nom: productData.nom.trim(),
      code: productData.code?.trim() || "",
      description: productData.description?.trim() || "",
      prixAchat: parseFloat(productData.prixAchat) || 0,
      prixVente: parseFloat(productData.prixVente) || 0,
      quantite: parseInt(productData.quantite) || 0,
      seuilAlerte: parseInt(productData.seuilAlerte) || 10,
      categorieId: productData.categorieId,
      categorieNom: productData.categorieNom,
      fournisseurId: productData.fournisseurId,
      fournisseurNom: productData.fournisseurNom,
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
      localImagePath: productData.localImagePath || null,
      actif: true
    };

    const newDocRef = doc(collection(db, PRODUCTS_COLLECTION));
    await setDoc(newDocRef, productDoc);
    
    // Mettre à jour le compteur de produits dans la catégorie
    await updateCategoryProductCount(productData.categorieId, 1);
    
    // Mettre à jour le compteur de produits dans le fournisseur
    await updateSupplierProductCount(productData.fournisseurId, 1);
    
    return {
      id: newDocRef.id,
      ...productDoc
    };
  } catch (error) {
    console.error("Erreur création produit:", error);
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy("nom"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération produits:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where("categorieId", "==", categoryId),
      where("actif", "==", true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération produits par catégorie:", error);
    throw error;
  }
};

export const checkProductCodeExists = async (code) => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where("code", "==", code.trim()),
      where("actif", "==", true)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Erreur vérification code produit:", error);
    throw error;
  }
};

export const updateCategoryProductCount = async (categoryId, increment) => {
  try {
    const category = await getCategoryById(categoryId);
    if (!category) return;
    
    const newCount = Math.max(0, (category.nombreProduits || 0) + increment);
    
    await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), {
      nombreProduits: newCount,
      dateModification: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur mise à jour compteur catégorie:", error);
    throw error;
  }
};

export const updateSupplierProductCount = async (supplierId, increment) => {
  try {
    const supplierDoc = await getDoc(doc(db, SUPPLIERS_COLLECTION, supplierId));
    if (!supplierDoc.exists()) return;
    
    const supplier = supplierDoc.data();
    const newCount = Math.max(0, (supplier.nombreProduits || 0) + increment);
    
    await updateDoc(doc(db, SUPPLIERS_COLLECTION, supplierId), {
      nombreProduits: newCount,
      dateModification: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur mise à jour compteur fournisseur:", error);
    throw error;
  }
};

// services/productService.js - Ajoutez ces fonctions :

// === PRODUITS (Fonctions supplémentaires) ===
export const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
    
    if (productDoc.exists()) {
      return {
        id: productDoc.id,
        ...productDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération produit:", error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    // Récupérer le produit existant
    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      throw new Error("Produit non trouvé");
    }

    // Vérifier si le code a changé et s'il est unique
    if (productData.code && productData.code !== existingProduct.code) {
      const exists = await checkProductCodeExists(productData.code);
      if (exists) {
        throw new Error("Ce code produit existe déjà");
      }
    }

    // Mettre à jour les compteurs si la catégorie change
    if (productData.categorieId !== existingProduct.categorieId) {
      // Décrémenter l'ancienne catégorie
      await updateCategoryProductCount(existingProduct.categorieId, -1);
      // Incrémenter la nouvelle catégorie
      await updateCategoryProductCount(productData.categorieId, 1);
    }

    // Mettre à jour les compteurs si le fournisseur change
    if (productData.fournisseurId !== existingProduct.fournisseurId) {
      // Décrémenter l'ancien fournisseur
      await updateSupplierProductCount(existingProduct.fournisseurId, -1);
      // Incrémenter le nouveau fournisseur
      await updateSupplierProductCount(productData.fournisseurId, 1);
    }

    const dataToUpdate = {
      nom: productData.nom.trim(),
      code: productData.code?.trim() || "",
      description: productData.description?.trim() || "",
      prixAchat: parseFloat(productData.prixAchat) || 0,
      prixVente: parseFloat(productData.prixVente) || 0,
      quantite: parseInt(productData.quantite) || 0,
      seuilAlerte: parseInt(productData.seuilAlerte) || 10,
      categorieId: productData.categorieId,
      categorieNom: productData.categorieNom,
      fournisseurId: productData.fournisseurId,
      fournisseurNom: productData.fournisseurNom,
      dateModification: serverTimestamp()
    };

    // Ajouter l'image si fournie
    if (productData.imageUrl) {
      dataToUpdate.imageUrl = productData.imageUrl;
    }

    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), dataToUpdate);
    return await getProductById(productId);
  } catch (error) {
    console.error("Erreur mise à jour produit:", error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    // Récupérer le produit avant suppression
    const product = await getProductById(productId);
    if (!product) {
      throw new Error("Produit non trouvé");
    }

    // Mettre à jour les compteurs
    await updateCategoryProductCount(product.categorieId, -1);
    await updateSupplierProductCount(product.fournisseurId, -1);

    // Supprimer le produit (soft delete)
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      actif: false,
      dateModification: serverTimestamp()
    });

    return productId;
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    throw error;
  }
};

// Récupérer les produits avec filtres
export const searchProducts = async (searchTerm) => {
  try {
    const allProducts = await getAllProducts();
    
    return allProducts.filter(product => 
      product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Erreur recherche produits:", error);
    throw error;
  }
};

// Produits en rupture de stock
export const getLowStockProducts = async () => {
  try {
    const allProducts = await getAllProducts();
    return allProducts.filter(product => 
      product.actif !== false && 
      product.quantite <= product.seuilAlerte
    );
  } catch (error) {
    console.error("Erreur récupération produits en rupture:", error);
    throw error;
  }
};

// Mettre à jour la quantité d'un produit
export const updateProductQuantity = async (productId, newQuantity) => {
  try {
    const quantity = parseInt(newQuantity) || 0;
    
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      quantite: Math.max(0, quantity),
      dateModification: serverTimestamp()
    });
    
    return productId;
  } catch (error) {
    console.error("Erreur mise à jour quantité:", error);
    throw error;
  }
};

export const getInventoryStats = async () => {
  try {
    const products = await getAllProducts();
    const activeProducts = products.filter(p => p.actif !== false);
    
    let totalValeurStock = 0;
    let totalValeurAchat = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let categoriesStats = {};
    
    for (const product of activeProducts) {
      const valeurVente = product.quantite * (product.prixVente || 0);
      const valeurAchat = product.quantite * (product.prixAchat || 0);
      
      totalValeurStock += valeurVente;
      totalValeurAchat += valeurAchat;
      
      if (product.quantite === 0) {
        outOfStockCount++;
      } else if (product.quantite <= product.seuilAlerte) {
        lowStockCount++;
      }
      
      // Stats par catégorie
      const categorie = product.categorieNom || 'Non catégorisé';
      if (!categoriesStats[categorie]) {
        categoriesStats[categorie] = {
          count: 0,
          totalValue: 0,
          lowStock: 0
        };
      }
      categoriesStats[categorie].count++;
      categoriesStats[categorie].totalValue += valeurVente;
      if (product.quantite <= product.seuilAlerte) {
        categoriesStats[categorie].lowStock++;
      }
    }
    
    const categoriesArray = Object.entries(categoriesStats).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => b.totalValue - a.totalValue);
    
    return {
      totalProducts: activeProducts.length,
      totalValeurStock: parseFloat(totalValeurStock.toFixed(2)),
      totalValeurAchat: parseFloat(totalValeurAchat.toFixed(2)),
      lowStockCount,
      outOfStockCount,
      categories: categoriesArray,
      profitPotentiel: parseFloat((totalValeurStock - totalValeurAchat).toFixed(2))
    };
  } catch (error) {
    console.error("Erreur calcul statistiques:", error);
    throw error;
  }
};

// Obtenir l'historique des mouvements de stock (à implémenter avec une collection séparée)
export const getStockMovements = async (limit = 50) => {
  try {
    // Vous pouvez créer une collection "stock_movements" plus tard
    // Pour l'instant, retournons un exemple
    return [];
  } catch (error) {
    console.error("Erreur récupération mouvements:", error);
    throw error;
  }
};

// Obtenir les produits par niveau de stock
export const getProductsByStockLevel = async (level = 'all') => {
  try {
    const allProducts = await getAllProducts();
    const activeProducts = allProducts.filter(p => p.actif !== false);
    
    switch (level) {
      case 'low':
        return activeProducts.filter(p => 
          p.quantite > 0 && p.quantite <= p.seuilAlerte
        );
      case 'out':
        return activeProducts.filter(p => p.quantite === 0);
      case 'normal':
        return activeProducts.filter(p => 
          p.quantite > p.seuilAlerte
        );
      default:
        return activeProducts;
    }
  } catch (error) {
    console.error("Erreur filtrage par niveau stock:", error);
    throw error;
  }
};

// Ajouter un mouvement de stock
export const addStockMovement = async (movementData) => {
  try {
    // Vous pouvez créer une collection "stock_movements" plus tard
    console.log("Mouvement de stock:", movementData);
    return movementData;
  } catch (error) {
    console.error("Erreur ajout mouvement:", error);
    throw error;
  }
};
// Service complet
export const productService = {
  // Catégories
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  checkUniqueCategoryName,
  
  // Fournisseurs
  getAllSuppliers,
  createSupplier,
  checkSupplierExists,
  getSupplierById,
  updateSupplier,
  deleteSupplier,

  
  // Produits
  createProduct,
  getAllProducts,
  getProductsByCategory,
  checkProductCodeExists,
  updateProductQuantity,
  getProductById,
  updateProduct,
  getInventoryStats,
  getStockMovements,
  getProductsByStockLevel,
  addStockMovement,
  
  // Utilitaires
  updateCategoryProductCount,
  updateSupplierProductCount
};

export default productService;