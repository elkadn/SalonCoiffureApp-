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
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const SERVICES_COLLECTION = "services";
const PRODUCTS_COLLECTION = "products";
const USERS_COLLECTION = "users";


export const createService = async (serviceData) => {
  try {
    let prixMinimum = parseFloat(serviceData.prix) || 0;

    if (serviceData.produitsIds && serviceData.produitsIds.length > 0) {
      const produits = await getProductsByIds(serviceData.produitsIds);
      const totalPrixProduits = produits.reduce((sum, produit) => {
        return sum + (produit.prixVente || 0);
      }, 0);

      if (prixMinimum < totalPrixProduits) {
        throw new Error(
          `Le prix du service (${prixMinimum} €) doit être au moins égal à la somme des produits (${totalPrixProduits} €)`
        );
      }
    }

    const serviceDoc = {
      nom: serviceData.nom.trim(),
      description: serviceData.description?.trim() || "",
      prix: prixMinimum,
      duree: parseInt(serviceData.duree) || 30,
      produitsIds: serviceData.produitsIds || [],
      stylistesIds: serviceData.stylistesIds || [],
      images: serviceData.images || [], 
      imageUrls: serviceData.images || [], 
      categorie: serviceData.categorie?.trim() || "",
      actif: true,
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
    };

    const newDocRef = doc(collection(db, SERVICES_COLLECTION));
    await setDoc(newDocRef, serviceDoc);

    return {
      id: newDocRef.id,
      ...serviceDoc,
    };
  } catch (error) {
    console.error("Erreur création service:", error);
    throw error;
  }
};

export const getAllServices = async () => {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    const q = query(servicesRef, orderBy("dateCreation", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur récupération services:", error);
    throw error;
  }
};

export const getServiceById = async (serviceId) => {
  try {
    const serviceDoc = await getDoc(doc(db, SERVICES_COLLECTION, serviceId));

    if (serviceDoc.exists()) {
      return {
        id: serviceDoc.id,
        ...serviceDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération service:", error);
    throw error;
  }
};

export const updateService = async (serviceId, serviceData) => {
  try {
    const existingService = await getServiceById(serviceId);
    if (!existingService) {
      throw new Error("Service non trouvé");
    }

    let prixMinimum = parseFloat(serviceData.prix) || existingService.prix;

    if (serviceData.produitsIds && serviceData.produitsIds.length > 0) {
      const produits = await getProductsByIds(serviceData.produitsIds);
      const totalPrixProduits = produits.reduce((sum, produit) => {
        return sum + (produit.prixVente || 0);
      }, 0);

      if (prixMinimum < totalPrixProduits) {
        throw new Error(
          `Le prix du service (${prixMinimum} €) doit être au moins égal à la somme des produits (${totalPrixProduits} €)`
        );
      }
    }

    const dataToUpdate = {
      nom: serviceData.nom?.trim() || existingService.nom,
      description:
        serviceData.description?.trim() || existingService.description,
      prix: prixMinimum,
      duree: parseInt(serviceData.duree) || existingService.duree,
      produitsIds: serviceData.produitsIds || existingService.produitsIds,
      stylistesIds: serviceData.stylistesIds || existingService.stylistesIds,
      categorie: serviceData.categorie?.trim() || existingService.categorie,
      dateModification: serverTimestamp(),
    };

    if (serviceData.images) {
      dataToUpdate.images = serviceData.images;
      dataToUpdate.imageUrls = serviceData.images; 
    }

    await updateDoc(doc(db, SERVICES_COLLECTION, serviceId), dataToUpdate);
    return await getServiceById(serviceId);
  } catch (error) {
    console.error("Erreur mise à jour service:", error);
    throw error;
  }
};

export const deleteService = async (serviceId) => {
  try {
    await updateDoc(doc(db, SERVICES_COLLECTION, serviceId), {
      actif: false,
      dateModification: serverTimestamp(),
    });

    console.log("Service désactivé :", serviceId);
    return serviceId;
  } catch (error) {
    console.error("Erreur suppression service:", error);
    throw error;
  }
};

export const getProductsByIds = async (productIds) => {
  try {
    if (!productIds || productIds.length === 0) return [];

    const products = [];
    for (const productId of productIds) {
      try {
        const productDoc = await getDoc(
          doc(db, PRODUCTS_COLLECTION, productId)
        );
        if (productDoc.exists()) {
          products.push({
            id: productDoc.id,
            ...productDoc.data(),
          });
        }
      } catch (error) {
        console.error(`Erreur récupération produit ${productId}:`, error);
      }
    }
    return products;
  } catch (error) {
    console.error("Erreur récupération produits par IDs:", error);
    throw error;
  }
};

export const getStylistesByIds = async (stylisteIds) => {
  try {
    if (!stylisteIds || stylisteIds.length === 0) return [];

    const stylistes = [];
    for (const stylisteId of stylisteIds) {
      try {
        const stylisteDoc = await getDoc(doc(db, USERS_COLLECTION, stylisteId));
        if (stylisteDoc.exists()) {
          const data = stylisteDoc.data();
          if (data.role === "stylist") {
            stylistes.push({
              id: stylisteDoc.id,
              ...data,
            });
          }
        }
      } catch (error) {
        console.error(`Erreur récupération styliste ${stylisteId}:`, error);
      }
    }
    return stylistes;
  } catch (error) {
    console.error("Erreur récupération stylistes par IDs:", error);
    throw error;
  }
};


export const getAllStylistes = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("role", "==", "styliste"),
      where("actif", "==", true)
    );

    const snapshot = await getDocs(q);
    const stylistes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return stylistes.sort((a, b) => {
      const nomA = (a.prenom || "").toLowerCase();
      const nomB = (b.prenom || "").toLowerCase();
      return nomA.localeCompare(nomB);
    });
  } catch (error) {
    console.error("Erreur récupération stylistes:", error);
    return [];
  }
};

export const searchServices = async (searchTerm) => {
  try {
    const allServices = await getAllServices();

    return allServices.filter(
      (service) =>
        service.actif !== false &&
        (service.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.categorie?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error("Erreur recherche services:", error);
    throw error;
  }
};

export const getServicesByCategory = async (category) => {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    const q = query(
      servicesRef,
      where("categorie", "==", category),
      where("actif", "==", true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur récupération services par catégorie:", error);
    throw error;
  }
};

export const getServicesByStyliste = async (stylisteId) => {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    const q = query(
      servicesRef,
      where("stylistesIds", "array-contains", stylisteId),
      where("actif", "==", true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur récupération services par styliste:", error);
    throw error;
  }
};

export const getServicesStats = async () => {
  try {
    const services = await getAllServices();
    const activeServices = services.filter((s) => s.actif !== false);

    let totalServices = activeServices.length;
    let categories = {};
    let totalValeur = 0;

    for (const service of activeServices) {
      totalValeur += service.prix || 0;

      const categorie = service.categorie || "Non catégorisé";
      if (!categories[categorie]) {
        categories[categorie] = {
          count: 0,
          totalValue: 0,
        };
      }
      categories[categorie].count++;
      categories[categorie].totalValue += service.prix || 0;
    }

    const categoriesArray = Object.entries(categories).map(([name, stats]) => ({
      name,
      ...stats,
    }));

    return {
      totalServices,
      totalValeur: parseFloat(totalValeur.toFixed(2)),
      categories: categoriesArray,
      averagePrice:
        totalServices > 0
          ? parseFloat((totalValeur / totalServices).toFixed(2))
          : 0,
    };
  } catch (error) {
    console.error("Erreur calcul statistiques services:", error);
    throw error;
  }
};

export const serviceService = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,

  getProductsByIds,
  getStylistesByIds,
  getAllStylistes,

  searchServices,
  getServicesByCategory,
  getServicesByStyliste,

  getServicesStats,
};

export default serviceService;
