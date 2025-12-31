// screens/admin/statistics/AppointmentStats.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getAllAppointments } from "../../../services/appointmentService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const { width } = Dimensions.get('window');

const AppointmentStats = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // day, week, month, year

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      const appointments = await getAllAppointments();
      calculateStats(appointments);
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments) => {
    const now = new Date();
    let filteredAppointments = [...appointments];

    // Filtrer par période
    if (timeRange === 'day') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filteredAppointments = appointments.filter(app => {
        const appDate = app.date.toDate();
        return appDate >= today;
      });
    } else if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredAppointments = appointments.filter(app => {
        const appDate = app.date.toDate();
        return appDate >= weekAgo;
      });
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredAppointments = appointments.filter(app => {
        const appDate = app.date.toDate();
        return appDate >= monthAgo;
      });
    }

    const totalAppointments = filteredAppointments.length;
    const confirmedCount = filteredAppointments.filter(a => a.status === 'confirmed').length;
    const completedCount = filteredAppointments.filter(a => a.status === 'completed').length;
    const cancelledCount = filteredAppointments.filter(a => a.status === 'cancelled').length;
    
    const totalRevenue = filteredAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.servicePrice || 0), 0);
    
    const avgRevenue = completedCount > 0 ? totalRevenue / completedCount : 0;
    
    // Group by stylist
    const stylistStats = {};
    filteredAppointments.forEach(app => {
      if (app.status === 'completed') {
        if (!stylistStats[app.stylistId]) {
          stylistStats[app.stylistId] = {
            name: app.stylistName,
            count: 0,
            revenue: 0
          };
        }
        stylistStats[app.stylistId].count++;
        stylistStats[app.stylistId].revenue += app.servicePrice || 0;
      }
    });

    // Group by service
    const serviceStats = {};
    filteredAppointments.forEach(app => {
      if (app.status === 'completed') {
        if (!serviceStats[app.serviceId]) {
          serviceStats[app.serviceId] = {
            name: app.serviceName,
            count: 0,
            revenue: 0
          };
        }
        serviceStats[app.serviceId].count++;
        serviceStats[app.serviceId].revenue += app.servicePrice || 0;
      }
    });

    setStats({
      totalAppointments,
      confirmedCount,
      completedCount,
      cancelledCount,
      totalRevenue,
      avgRevenue,
      stylistStats: Object.values(stylistStats),
      serviceStats: Object.values(serviceStats),
      appointments: filteredAppointments
    });
  };

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'day': return "Aujourd'hui";
      case 'week': return "7 derniers jours";
      case 'month': return "30 derniers jours";
      case 'year': return "12 derniers mois";
      default: return "Période";
    }
  };

  const renderStatCard = (title, value, icon, color, subtitle = "") => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderTopCard = (title, data, type) => (
    <View style={styles.topCard}>
      <Text style={styles.topCardTitle}>{title}</Text>
      {data.slice(0, 5).map((item, index) => (
        <View key={index} style={styles.topItem}>
          <View style={styles.topItemInfo}>
            <Text style={styles.topItemName}>{item.name}</Text>
            <Text style={styles.topItemCount}>
              {type === 'stylist' ? `${item.count} visites` : `${item.count} fois`}
            </Text>
          </View>
          <Text style={styles.topItemRevenue}>{item.revenue.toFixed(2)} MAD</Text>
        </View>
      ))}
      {data.length === 0 && (
        <Text style={styles.noDataText}>Aucune donnée disponible</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistiques</Text>
        <Text style={styles.headerSubtitle}>{getTimeRangeText()}</Text>
      </View>

      <View style={styles.timeRangeSelector}>
        {['day', 'week', 'month', 'year'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextActive
            ]}>
              {range === 'day' ? 'Jour' : 
               range === 'week' ? 'Semaine' : 
               range === 'month' ? 'Mois' : 'Année'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Statistiques principales */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            "Rendez-vous",
            stats?.totalAppointments || 0,
            "event",
            "#4CAF50",
            "Total"
          )}
          {renderStatCard(
            "Visites",
            stats?.completedCount || 0,
            "check-circle",
            "#2196F3",
            "Effectuées"
          )}
          {renderStatCard(
            "Annulations",
            stats?.cancelledCount || 0,
            "cancel",
            "#F44336",
            "Annulés"
          )}
          {renderStatCard(
            "Revenus",
            `${(stats?.totalRevenue || 0).toFixed(2)} MAD`,
            "attach-money",
            "#FF9800",
            `Moyenne: ${(stats?.avgRevenue || 0).toFixed(2)} MAD`
          )}
        </View>

        {/* Top stylistes */}
        {renderTopCard("Top Stylistes", stats?.stylistStats || [], 'stylist')}

        {/* Top services */}
        {renderTopCard("Services Populaires", stats?.serviceStats || [], 'service')}

        {/* Dernières visites */}
        <View style={styles.recentVisitsCard}>
          <Text style={styles.recentVisitsTitle}>Dernières visites</Text>
          {stats?.appointments
            .filter(a => a.status === 'completed')
            .slice(0, 5)
            .map((visit, index) => (
              <View key={index} style={styles.recentVisit}>
                <View style={styles.recentVisitInfo}>
                  <Text style={styles.recentVisitClient}>{visit.clientName}</Text>
                  <Text style={styles.recentVisitService}>{visit.serviceName}</Text>
                </View>
                <View style={styles.recentVisitDetails}>
                  <Text style={styles.recentVisitDate}>
                    {format(visit.date.toDate(), "dd/MM HH:mm", { locale: fr })}
                  </Text>
                  <Text style={styles.recentVisitPrice}>{visit.servicePrice} MAD</Text>
                </View>
              </View>
            ))}
          {(!stats?.appointments || stats.appointments.filter(a => a.status === 'completed').length === 0) && (
            <Text style={styles.noDataText}>Aucune visite récente</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 16, color: "#666" },
  header: {
    backgroundColor: "white",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#333" },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 5 },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  timeRangeButtonActive: { backgroundColor: "#4CAF50" },
  timeRangeText: { fontSize: 14, color: "#666" },
  timeRangeTextActive: { color: "white", fontWeight: "600" },
  content: { flex: 1, padding: 15 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statTitle: { fontSize: 12, color: "#666", marginLeft: 8, fontWeight: "600" },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#333" },
  statSubtitle: { fontSize: 12, color: "#999", marginTop: 5 },
  topCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  topCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  topItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  topItemInfo: { flex: 1 },
  topItemName: { fontSize: 14, fontWeight: "600", color: "#333" },
  topItemCount: { fontSize: 12, color: "#666", marginTop: 2 },
  topItemRevenue: { fontSize: 14, fontWeight: "bold", color: "#4CAF50" },
  recentVisitsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recentVisitsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  recentVisit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  recentVisitInfo: { flex: 1 },
  recentVisitClient: { fontSize: 14, fontWeight: "600", color: "#333" },
  recentVisitService: { fontSize: 12, color: "#666", marginTop: 2 },
  recentVisitDetails: { alignItems: "flex-end" },
  recentVisitDate: { fontSize: 12, color: "#999" },
  recentVisitPrice: { fontSize: 14, fontWeight: "bold", color: "#4CAF50", marginTop: 2 },
  noDataText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
});

export default AppointmentStats;