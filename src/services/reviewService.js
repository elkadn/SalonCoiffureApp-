import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const REVIEWS_COLLECTION = "reviews";


export const addReview = async (serviceId, reviewData) => {
  try {
    const reviewDoc = {
      serviceId,
      clientId: reviewData.clientId, 
      clientName: reviewData.clientName.trim(),
      rating: parseInt(reviewData.rating),
      comment: reviewData.comment.trim(),
      date: reviewData.date || serverTimestamp(),
      status: "pending", 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const newDocRef = doc(collection(db, REVIEWS_COLLECTION));
    await setDoc(newDocRef, reviewDoc);

    return {
      id: newDocRef.id,
      ...reviewDoc,
    };
  } catch (error) {
    console.error("Erreur ajout avis:", error);
    throw error;
  }
};

export const getReviewsByService = async (serviceId, onlyApproved = true) => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);

    let snapshot;

    if (onlyApproved) {
      const q = query(reviewsRef, where("serviceId", "==", serviceId));
      snapshot = await getDocs(q);

      const allReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const approvedReviews = allReviews.filter(
        (review) => review.status === "approved"
      );

      return approvedReviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.date || 0);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.date || 0);
        return dateB - dateA; 
      });
    } else {
      const q = query(reviewsRef, where("serviceId", "==", serviceId));
      snapshot = await getDocs(q);

      const allReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return allReviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.date || 0);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.date || 0);
        return dateB - dateA;
      });
    }
  } catch (error) {
    console.error("Erreur récupération avis:", error);

    try {
      console.log("Tentative de récupération alternative...");
      const reviewsRef = collection(db, REVIEWS_COLLECTION);
      const snapshot = await getDocs(reviewsRef);

      const allReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let filteredReviews = allReviews.filter(
        (review) => review.serviceId === serviceId
      );

      if (onlyApproved) {
        filteredReviews = filteredReviews.filter(
          (review) => review.status === "approved"
        );
      }

      return filteredReviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.date || 0);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.date || 0);
        return dateB - dateA;
      });
    } catch (fallbackError) {
      console.error("Erreur récupération alternative:", fallbackError);
      throw error; 
    }
  }
};

export const approveReview = async (reviewId) => {
  try {
    await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erreur approbation avis:", error);
    throw error;
  }
};

export const rejectReview = async (reviewId) => {
  try {
    await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
      status: "rejected",
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erreur rejet avis:", error);
    throw error;
  }
};

export const getAllReviews = async () => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur récupération tous les avis:", error);
    throw error;
  }
};

export const getReviewStats = async (serviceId) => {
  try {
    const reviews = await getReviewsByService(serviceId, true);

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      ratingDistribution,
    };
  } catch (error) {
    console.error("Erreur calcul statistiques avis:", error);
    throw error;
  }
};

export const deleteReview = async (reviewId, userId) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      throw new Error("Avis non trouvé");
    }
    
    const reviewData = reviewDoc.data();
    
    if (reviewData.clientId !== userId) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cet avis");
    }
    
    await updateDoc(reviewRef, {
      status: "deleted",
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Erreur suppression avis:", error);
    throw error;
  }
};


export const getReviewsByUser = async (userId) => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where("clientId", "==", userId),
      where("status", "!=", "deleted") 
    );
    const snapshot = await getDocs(q);

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return reviews.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.date || 0);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.date || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Erreur récupération avis utilisateur:", error);

    try {
      const allReviews = await getAllReviews();
      return allReviews.filter(
        (review) => review.clientId === userId && review.status !== "deleted"
      );
    } catch (fallbackError) {
      throw error;
    }
  }
};
const reviewService = {
  addReview,
  getReviewsByService,
  getAllReviews,
  approveReview,
  rejectReview,
  getReviewStats,
  getReviewsByUser,
  deleteReview,
};

export default reviewService;
