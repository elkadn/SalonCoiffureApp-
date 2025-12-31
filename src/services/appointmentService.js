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
  Timestamp,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Collections
const APPOINTMENTS_COLLECTION = "appointments";
const CRENEAUX_COLLECTION = "creneaux";
const SERVICES_COLLECTION = "services";

// ============ RENDEZ-VOUS ============

// Créer un rendez-vous avec sélection automatique du styliste
export const createAppointment = async (appointmentData) => {
  try {
    const { serviceId, clientId, date, time, notes } = appointmentData;

    // 1. Récupérer le service
    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error("Service non trouvé");
    }

    // 2. Convertir la date et l'heure en objet Date
    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);

    // Calculer l'heure de fin basée sur la durée du service
    const endDateTime = new Date(appointmentDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (service.duree || 30));

    // 3. Trouver un styliste disponible
    const availableStylist = await findAvailableStylist(
      service.stylistesIds,
      appointmentDateTime,
      endDateTime,
      date,
      serviceId
    );

    if (!availableStylist) {
      throw new Error("Aucun styliste disponible pour ce créneau");
    }

    // 4. Créer le rendez-vous
    const appointmentId = doc(collection(db, APPOINTMENTS_COLLECTION)).id;
    const appointmentDoc = {
      id: appointmentId,
      serviceId,
      serviceName: service.nom,
      serviceDuration: service.duree,
      servicePrice: service.prix,
      clientId,
      clientName: appointmentData.clientName || "Client",
      stylistId: availableStylist.id,
      stylistName: `${availableStylist.prenom} ${availableStylist.nom}`,
      date: Timestamp.fromDate(appointmentDateTime),
      endDate: Timestamp.fromDate(endDateTime),
      time: time,
      dateString: date, // Pour faciliter les requêtes
      status: "confirmed", // confirmed, cancelled, completed
      notes: notes || "",
      paymentStatus: "pending", // pending, paid, refunded
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 5. Utiliser une transaction pour garantir la cohérence
    const batch = writeBatch(db);

    // Créer le rendez-vous
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    batch.set(appointmentRef, appointmentDoc);

    // 6. Vérifier si on a besoin de bloquer le créneau (optionnel)
    // Vous pouvez ajouter ici un système de réservation temporaire

    await batch.commit();

    return appointmentDoc;
  } catch (error) {
    console.error("Erreur création rendez-vous:", error);
    throw error;
  }
};

// Trouver un styliste disponible
export const findAvailableStylist = async (
  stylisteIds,
  startTime,
  endTime,
  dateString,
  serviceId
) => {
  try {
    if (!stylisteIds || stylisteIds.length === 0) {
      throw new Error("Aucun styliste associé à ce service");
    }

    // 1. Récupérer tous les stylistes actifs
    const allStylists = await getAllStylistes();
    const serviceStylists = allStylists.filter((stylist) =>
      stylisteIds.includes(stylist.id)
    );

    if (serviceStylists.length === 0) {
      throw new Error("Aucun styliste actif pour ce service");
    }

    // 2. Récupérer les créneaux des stylistes pour ce jour
    const dayOfWeek = getDayOfWeekFromDate(dateString);
    const creneauxQuery = query(
      collection(db, CRENEAUX_COLLECTION),
      where("stylisteId", "in", stylisteIds),
      where("jour", "==", dayOfWeek),
      where("actif", "==", true)
    );

    const creneauxSnapshot = await getDocs(creneauxQuery);
    const creneaux = creneauxSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Récupérer les rendez-vous existants pour cette période
    const appointmentsQuery = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("dateString", "==", dateString),
      where("status", "in", ["confirmed", "pending"]), // Rendez-vous actifs
      where("stylistId", "in", stylisteIds)
    );

    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const existingAppointments = appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 4. Trouver un styliste disponible
    for (const stylist of serviceStylists) {
      // Vérifier si le styliste a un créneau pour ce jour
      const stylistCreneaux = creneaux.filter(
        (c) => c.stylisteId === stylist.id
      );

      if (stylistCreneaux.length === 0) continue;

      // Vérifier si le styliste est disponible pendant ce créneau
      const isWithinCreneau = stylistCreneaux.some((creneau) => {
        const [startHour, startMinute] = creneau.heureDebut
          .split(":")
          .map(Number);
        const [endHour, endMinute] = creneau.heureFin.split(":").map(Number);

        const creneauStart = new Date(startTime);
        creneauStart.setHours(startHour, startMinute, 0, 0);

        const creneauEnd = new Date(startTime);
        creneauEnd.setHours(endHour, endMinute, 0, 0);

        return startTime >= creneauStart && endTime <= creneauEnd;
      });

      if (!isWithinCreneau) continue;

      // Vérifier les conflits avec les rendez-vous existants
      const stylistAppointments = existingAppointments.filter(
        (app) => app.stylistId === stylist.id
      );

      const hasConflict = stylistAppointments.some((app) => {
        const appStart = app.date.toDate();
        const appEnd = app.endDate.toDate();

        // Vérifier si les périodes se chevauchent
        return startTime < appEnd && endTime > appStart;
      });

      if (!hasConflict) {
        return stylist; // Styliste disponible trouvé
      }
    }

    return null; // Aucun styliste disponible
  } catch (error) {
    console.error("Erreur recherche styliste:", error);
    throw error;
  }
};

// Fonction utilitaire pour obtenir le jour de la semaine
const getDayOfWeekFromDate = (dateString) => {
  const date = new Date(dateString);
  const days = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];
  return days[date.getDay()];
};

// Récupérer tous les rendez-vous d'un client
// Récupérer tous les rendez-vous d'un client (version temporaire sans orderBy)
export const getClientAppointments = async (clientId) => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);
    const q = query(
      appointmentsRef,
      where("clientId", "==", clientId)
      // Enlevez temporairement: orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);

    // Triez manuellement après récupération
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Tri manuel par date (du plus récent au plus ancien)
    appointments.sort((a, b) => {
      const dateA = a.date?.toDate() || new Date(0);
      const dateB = b.date?.toDate() || new Date(0);
      return dateB - dateA; // Tri descendant
    });

    return appointments;
  } catch (error) {
    console.error("Erreur récupération rendez-vous client:", error);
    throw error;
  }
};

// Récupérer tous les rendez-vous d'un styliste
// Améliorez la fonction getStylistAppointments
export const getStylistAppointments = async (stylistId) => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);

    // Version simplifiée sans orderBy qui nécessite un index
    const q = query(
      appointmentsRef,
      where("stylistId", "==", stylistId)
      // Retirez temporairement le orderBy pour éviter l'erreur d'index
    );

    const snapshot = await getDocs(q);

    // Triez manuellement après récupération
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Tri manuel par date (du plus récent au plus ancien)
    appointments.sort((a, b) => {
      const dateA = a.date?.toDate() || new Date(0);
      const dateB = b.date?.toDate() || new Date(0);
      return dateB - dateA; // Tri descendant
    });

    return appointments;
  } catch (error) {
    console.error("Erreur récupération rendez-vous styliste:", error);
    throw error;
  }
};
// Ajoutez cette fonction pour les statistiques styliste
export const getStylistAppointmentStats = async (
  stylistId,
  period = "month"
) => {
  try {
    let startDate = new Date();

    // Définir la période
    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Récupérer les rendez-vous
    const appointments = await getStylistAppointments(stylistId, {
      startDate,
      order: "desc",
    });

    // Calculer les statistiques
    const stats = {
      total: appointments.length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      upcoming: appointments.filter((a) => {
        if (a.status !== "confirmed") return false;
        const date = a.date.toDate();
        return date > new Date();
      }).length,
      revenue: appointments
        .filter((a) => a.status === "completed")
        .reduce((sum, a) => sum + (a.servicePrice || 0), 0),
      averageRating: 0, // À implémenter si vous avez un système de notation
    };

    return stats;
  } catch (error) {
    console.error("Erreur calcul statistiques styliste:", error);
    throw error;
  }
};

// Annuler un rendez-vous
export const cancelAppointment = async (appointmentId) => {
  try {
    await updateDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId), {
      status: "cancelled",
      updatedAt: serverTimestamp(),
    });

    return appointmentId;
  } catch (error) {
    console.error("Erreur annulation rendez-vous:", error);
    throw error;
  }
};

// Vérifier la disponibilité d'un créneau
export const checkAvailability = async (serviceId, date, time) => {
  try {
    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error("Service non trouvé");
    }

    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");
    const startTime = new Date(year, month - 1, day, hours, minutes);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + (service.duree || 30));

    const availableStylist = await findAvailableStylist(
      service.stylistesIds,
      startTime,
      endTime,
      date,
      serviceId
    );

    return {
      available: !!availableStylist,
      stylist: availableStylist,
      service,
    };
  } catch (error) {
    console.error("Erreur vérification disponibilité:", error);
    throw error;
  }
};

// Récupérer les horaires disponibles pour un service
export const getAvailableSlots = async (serviceId, date) => {
  try {
    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error("Service non trouvé");
    }

    const dayOfWeek = getDayOfWeekFromDate(date);
    const slots = [];

    // Récupérer tous les créneaux des stylistes pour ce jour
    const creneauxQuery = query(
      collection(db, CRENEAUX_COLLECTION),
      where("stylisteId", "in", service.stylistesIds),
      where("jour", "==", dayOfWeek),
      where("actif", "==", true)
    );

    const creneauxSnapshot = await getDocs(creneauxQuery);
    const creneaux = creneauxSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Récupérer les rendez-vous existants
    const appointmentsQuery = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("dateString", "==", date),
      where("status", "in", ["confirmed", "pending"])
    );

    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const existingAppointments = appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Générer les créneaux disponibles
    for (const creneau of creneaux) {
      const [startHour, startMinute] = creneau.heureDebut
        .split(":")
        .map(Number);
      const [endHour, endMinute] = creneau.heureFin.split(":").map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      // Générer des créneaux toutes les 15 minutes
      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + service.duree);

        // Vérifier si le créneau tient dans l'horaire du styliste
        if (slotEnd <= endTime) {
          // Vérifier les conflits avec les rendez-vous existants
          const hasConflict = existingAppointments.some((app) => {
            if (app.stylistId !== creneau.stylisteId) return false;

            const appStart = app.date.toDate();
            const appEnd = app.endDate.toDate();

            return currentTime < appEnd && slotEnd > appStart;
          });

          if (!hasConflict) {
            slots.push({
              time: `${currentTime
                .getHours()
                .toString()
                .padStart(2, "0")}:${currentTime
                .getMinutes()
                .toString()
                .padStart(2, "0")}`,
              stylistId: creneau.stylisteId,
              available: true,
            });
          }
        }

        // Avancer de 15 minutes pour le prochain créneau
        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }
    }

    // Trier les créneaux par heure
    slots.sort((a, b) => a.time.localeCompare(b.time));

    return slots;
  } catch (error) {
    console.error("Erreur récupération créneaux:", error);
    throw error;
  }
};

// Fonction pour récupérer un service par ID (si elle n'existe pas déjà)
const getServiceById = async (serviceId) => {
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

// Fonction pour récupérer tous les stylistes (si elle n'existe pas déjà)
const getAllStylistes = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("role", "==", "styliste"),
      where("actif", "==", true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur récupération stylistes:", error);
    return [];
  }
};

export const getClientAppointmentStats = async (clientId) => {
  try {
    const appointments = await getClientAppointments(clientId);

    const stats = {
      total: appointments.length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      upcoming: appointments.filter((a) => {
        if (a.status !== "confirmed") return false;
        const date = a.date.toDate();
        return date > new Date();
      }).length,
      totalSpent: appointments
        .filter((a) => a.status === "completed")
        .reduce((sum, a) => sum + (a.servicePrice || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error("Erreur calcul statistiques:", error);
    throw error;
  }
};

// Mettre à jour le statut d'un rendez-vous (pour l'admin)
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const validStatuses = ["confirmed", "cancelled", "completed", "pending"];
    if (!validStatuses.includes(status)) {
      throw new Error("Statut invalide");
    }

    await updateDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId), {
      status,
      updatedAt: serverTimestamp(),
    });

    return appointmentId;
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
    throw error;
  }
};

// Récupérer tous les rendez-vous (pour l'admin)
export const getAllAppointments = async (startDate, endDate) => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);
    let q = query(appointmentsRef, orderBy("date", "desc"));

    if (startDate && endDate) {
      q = query(
        appointmentsRef,
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur récupération tous les rendez-vous:", error);
    throw error;
  }
};

export const getAppointmentById = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    const appointmentDoc = await getDoc(appointmentRef);

    if (appointmentDoc.exists()) {
      return {
        id: appointmentDoc.id,
        ...appointmentDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération rendez-vous par ID:", error);
    throw error;
  }
};

// Récupérer les informations du client pour un rendez-vous
export const getClientInfoForAppointment = async (clientId) => {
  try {
    const userRef = doc(db, "users", clientId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération info client:", error);
    return null;
  }
};

// Service complet
export const appointmentService = {
  createAppointment,
  findAvailableStylist,
  getClientAppointments,
  getStylistAppointments,
  cancelAppointment,
  checkAvailability,
  getAvailableSlots,
  getClientAppointmentStats,
  updateAppointmentStatus,
  getAllAppointments,
  getStylistAppointmentStats,
  getAppointmentById,
  getClientInfoForAppointment,
};

export default appointmentService;
