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

const APPOINTMENTS_COLLECTION = "appointments";
const CRENEAUX_COLLECTION = "creneaux";
const SERVICES_COLLECTION = "services";


export const createAppointment = async (appointmentData) => {
  try {
    const { serviceId, clientId, date, time, notes } = appointmentData;

    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error("Service non trouvé");
    }

    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);

    const endDateTime = new Date(appointmentDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (service.duree || 30));

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
      dateString: date, 
      status: "confirmed", 
      notes: notes || "",
      paymentStatus: "pending", 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const batch = writeBatch(db);

    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    batch.set(appointmentRef, appointmentDoc);

 

    await batch.commit();

    return appointmentDoc;
  } catch (error) {
    console.error("Erreur création rendez-vous:", error);
    throw error;
  }
};

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

    const allStylists = await getAllStylistes();
    const serviceStylists = allStylists.filter((stylist) =>
      stylisteIds.includes(stylist.id)
    );

    if (serviceStylists.length === 0) {
      throw new Error("Aucun styliste actif pour ce service");
    }

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

    const appointmentsQuery = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("dateString", "==", dateString),
      where("status", "in", ["confirmed", "pending"]), 
      where("stylistId", "in", stylisteIds)
    );

    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const existingAppointments = appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    for (const stylist of serviceStylists) {
      const stylistCreneaux = creneaux.filter(
        (c) => c.stylisteId === stylist.id
      );

      if (stylistCreneaux.length === 0) continue;

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

      const stylistAppointments = existingAppointments.filter(
        (app) => app.stylistId === stylist.id
      );

      const hasConflict = stylistAppointments.some((app) => {
        const appStart = app.date.toDate();
        const appEnd = app.endDate.toDate();

        return startTime < appEnd && endTime > appStart;
      });

      if (!hasConflict) {
        return stylist; 
      }
    }

    return null; 
  } catch (error) {
    console.error("Erreur recherche styliste:", error);
    throw error;
  }
};

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


export const getClientAppointments = async (clientId) => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);
    const q = query(
      appointmentsRef,
      where("clientId", "==", clientId)
    );

    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    appointments.sort((a, b) => {
      const dateA = a.date?.toDate() || new Date(0);
      const dateB = b.date?.toDate() || new Date(0);
      return dateB - dateA; 
    });

    return appointments;
  } catch (error) {
    console.error("Erreur récupération rendez-vous client:", error);
    throw error;
  }
};

export const getStylistAppointments = async (stylistId) => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);

    const q = query(
      appointmentsRef,
      where("stylistId", "==", stylistId)
    );

    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    appointments.sort((a, b) => {
      const dateA = a.date?.toDate() || new Date(0);
      const dateB = b.date?.toDate() || new Date(0);
      return dateB - dateA; 
    });

    return appointments;
  } catch (error) {
    console.error("Erreur récupération rendez-vous styliste:", error);
    throw error;
  }
};
export const getStylistAppointmentStats = async (
  stylistId,
  period = "month"
) => {
  try {
    let startDate = new Date();

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

    const appointments = await getStylistAppointments(stylistId, {
      startDate,
      order: "desc",
    });

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
      averageRating: 0, 
    };

    return stats;
  } catch (error) {
    console.error("Erreur calcul statistiques styliste:", error);
    throw error;
  }
};

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

export const getAvailableSlots = async (serviceId, date) => {
  try {
    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error("Service non trouvé");
    }

    const dayOfWeek = getDayOfWeekFromDate(date);
    const slots = [];

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

    for (const creneau of creneaux) {
      const [startHour, startMinute] = creneau.heureDebut
        .split(":")
        .map(Number);
      const [endHour, endMinute] = creneau.heureFin.split(":").map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + service.duree);

        if (slotEnd <= endTime) {
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

        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }
    }

    slots.sort((a, b) => a.time.localeCompare(b.time));

    return slots;
  } catch (error) {
    console.error("Erreur récupération créneaux:", error);
    throw error;
  }
};

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
