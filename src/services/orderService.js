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
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Collections
const ORDERS_COLLECTION = "orders";
const ORDER_ITEMS_COLLECTION = "order_items";

// ============ COMMANDES ============

// Créer une nouvelle commande
export const createOrder = async (orderData) => {
  try {
    const orderDoc = {
      supplierId: orderData.supplierId,
      supplierName: orderData.supplierName,
      orderNumber: orderData.orderNumber || generateOrderNumber(),
      orderDate: serverTimestamp(),
      expectedDeliveryDate: orderData.expectedDeliveryDate || null,
      status: 'pending', // pending, confirmed, delivered, cancelled
      totalAmount: orderData.totalAmount || 0,
      notes: orderData.notes?.trim() || "",
      createdBy: orderData.createdBy || 'admin',
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp()
    };

    const newOrderRef = doc(collection(db, ORDERS_COLLECTION));
    await setDoc(newOrderRef, orderDoc);
    
    // Créer les items de commande
    if (orderData.items && orderData.items.length > 0) {
      await createOrderItems(newOrderRef.id, orderData.items);
    }
    
    return {
      id: newOrderRef.id,
      ...orderDoc
    };
  } catch (error) {
    console.error("Erreur création commande:", error);
    throw error;
  }
};

// Créer les items de commande
const createOrderItems = async (orderId, items) => {
  try {
    const batch = writeBatch(db);
    
    items.forEach(item => {
      const itemRef = doc(collection(db, ORDER_ITEMS_COLLECTION));
      const itemDoc = {
        orderId: orderId,
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode || "",
        quantity: parseInt(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        totalPrice: parseFloat(item.quantity) * parseFloat(item.unitPrice) || 0
      };
      
      batch.set(itemRef, itemDoc);
    });
    
    await batch.commit();
    
    // Mettre à jour le montant total
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
    }, 0);
    
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      totalAmount: totalAmount,
      dateModification: serverTimestamp()
    });
    
    return items.length;
  } catch (error) {
    console.error("Erreur création items commande:", error);
    throw error;
  }
};

// Générer un numéro de commande
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `CMD-${year}${month}${day}-${random}`;
};

// Récupérer toutes les commandes
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy("orderDate", "desc"));
    const snapshot = await getDocs(q);
    
    const orders = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const orderData = docSnapshot.data();
        const items = await getOrderItems(docSnapshot.id);
        
        return {
          id: docSnapshot.id,
          ...orderData,
          items: items,
          itemCount: items.length
        };
      })
    );
    
    return orders;
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    throw error;
  }
};

// Récupérer les items d'une commande
export const getOrderItems = async (orderId) => {
  try {
    const itemsRef = collection(db, ORDER_ITEMS_COLLECTION);
    const q = query(itemsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération items commande:", error);
    throw error;
  }
};

// Récupérer une commande par ID
export const getOrderById = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (orderDoc.exists()) {
      const orderData = orderDoc.data();
      const items = await getOrderItems(orderId);
      
      return {
        id: orderDoc.id,
        ...orderData,
        items: items,
        itemCount: items.length
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération commande:", error);
    throw error;
  }
};

// Récupérer les commandes par fournisseur
export const getOrdersBySupplier = async (supplierId) => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(
      ordersRef, 
      where("supplierId", "==", supplierId),
      orderBy("orderDate", "desc")
    );
    
    const snapshot = await getDocs(q);
    
    const orders = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const orderData = docSnapshot.data();
        const items = await getOrderItems(docSnapshot.id);
        
        return {
          id: docSnapshot.id,
          ...orderData,
          items: items,
          itemCount: items.length
        };
      })
    );
    
    return orders;
  } catch (error) {
    console.error("Erreur récupération commandes par fournisseur:", error);
    throw error;
  }
};

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (orderId, status, notes = "") => {
  try {
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error("Statut invalide");
    }
    
    const updateData = {
      status: status,
      dateModification: serverTimestamp()
    };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    // Si la commande est livrée, mettre à jour les stocks
    if (status === 'delivered') {
      await updateStockFromOrder(orderId);
    }
    
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
    return await getOrderById(orderId);
  } catch (error) {
    console.error("Erreur mise à jour statut commande:", error);
    throw error;
  }
};

// Mettre à jour les stocks après livraison
const updateStockFromOrder = async (orderId) => {
  try {
    const items = await getOrderItems(orderId);
    
    for (const item of items) {
      // Vous devrez implémenter updateProductQuantity dans productService
      // Cette fonction augmentera la quantité du produit
      console.log(`Mettre à jour stock produit ${item.productId} : +${item.quantity}`);
      // await updateProductQuantity(item.productId, item.quantity, 'increase');
    }
    
    return true;
  } catch (error) {
    console.error("Erreur mise à jour stocks:", error);
    throw error;
  }
};

// Mettre à jour une commande
export const updateOrder = async (orderId, orderData) => {
  try {
    const updateData = {
      supplierId: orderData.supplierId,
      supplierName: orderData.supplierName,
      expectedDeliveryDate: orderData.expectedDeliveryDate || null,
      notes: orderData.notes?.trim() || "",
      dateModification: serverTimestamp()
    };
    
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
    
    // Mettre à jour les items si fournis
    if (orderData.items && orderData.items.length > 0) {
      // Supprimer les anciens items
      await deleteOrderItems(orderId);
      // Créer les nouveaux items
      await createOrderItems(orderId, orderData.items);
    }
    
    return await getOrderById(orderId);
  } catch (error) {
    console.error("Erreur mise à jour commande:", error);
    throw error;
  }
};

// Supprimer les items d'une commande
const deleteOrderItems = async (orderId) => {
  try {
    const items = await getOrderItems(orderId);
    const batch = writeBatch(db);
    
    items.forEach(item => {
      batch.delete(doc(db, ORDER_ITEMS_COLLECTION, item.id));
    });
    
    await batch.commit();
    return items.length;
  } catch (error) {
    console.error("Erreur suppression items commande:", error);
    throw error;
  }
};

// Supprimer une commande
export const deleteOrder = async (orderId) => {
  try {
    // Supprimer d'abord les items
    await deleteOrderItems(orderId);
    // Puis la commande
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    return orderId;
  } catch (error) {
    console.error("Erreur suppression commande:", error);
    throw error;
  }
};

// Obtenir les statistiques des commandes
export const getOrderStats = async () => {
  try {
    const orders = await getAllOrders();
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalAmount: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0
    };
    
    return stats;
  } catch (error) {
    console.error("Erreur calcul statistiques commandes:", error);
    throw error;
  }
};

// Rechercher des commandes
export const searchOrders = async (searchTerm) => {
  try {
    const allOrders = await getAllOrders();
    
    return allOrders.filter(order => 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Erreur recherche commandes:", error);
    throw error;
  }
};

// Exporter le service
export const orderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersBySupplier,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  getOrderStats,
  searchOrders,
  getOrderItems
};

export default orderService;