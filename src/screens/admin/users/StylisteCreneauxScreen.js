import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { getStylisteCreneaux, addCreneau, updateCreneau, deleteCreneau } from '../../../services/creneauService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StylisteCreneauxScreen = ({ navigation, route }) => {
  const { stylisteId, stylisteName } = route.params || {};
  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCreneau, setEditingCreneau] = useState(null);
  
  const [formData, setFormData] = useState({
    jour: '',
    heureDebut: '09:00',
    heureFin: '17:00',
    actif: true
  });

  useEffect(() => {
    loadCreneaux();
  }, [stylisteId]);

  const loadCreneaux = async () => {
    try {
      const creneauxData = await getStylisteCreneaux(stylisteId);
      setCreneaux(creneauxData || []);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les créneaux');
    } finally {
      setLoading(false);
    }
  };

  const joursSemaine = [
    { id: 'lundi', label: 'Lundi' },
    { id: 'mardi', label: 'Mardi' },
    { id: 'mercredi', label: 'Mercredi' },
    { id: 'jeudi', label: 'Jeudi' },
    { id: 'vendredi', label: 'Vendredi' },
    { id: 'samedi', label: 'Samedi' },
    { id: 'dimanche', label: 'Dimanche' }
  ];

  const handleOpenModal = (creneau = null) => {
    if (creneau) {
      setEditingCreneau(creneau.id);
      setFormData({
        jour: creneau.jour,
        heureDebut: creneau.heureDebut,
        heureFin: creneau.heureFin,
        actif: creneau.actif
      });
    } else {
      setEditingCreneau(null);
      setFormData({
        jour: '',
        heureDebut: '09:00',
        heureFin: '17:00',
        actif: true
      });
    }
    setModalVisible(true);
  };

  const handleSaveCreneau = async () => {
    if (!formData.jour) {
      Alert.alert('Erreur', 'Veuillez sélectionner un jour');
      return;
    }

    if (formData.heureDebut >= formData.heureFin) {
      Alert.alert('Erreur', 'L\'heure de début doit être avant l\'heure de fin');
      return;
    }

    try {
      const creneauData = {
        ...formData,
        stylisteId
      };

      if (editingCreneau) {
        await updateCreneau(editingCreneau, creneauData);
        Alert.alert('Succès', 'Créneau mis à jour');
      } else {
        await addCreneau(creneauData);
        Alert.alert('Succès', 'Créneau ajouté');
      }

      setModalVisible(false);
      loadCreneaux();
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    }
  };

  const handleDeleteCreneau = (creneauId) => {
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer ce créneau ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCreneau(creneauId);
              loadCreneaux();
              Alert.alert('Succès', 'Créneau supprimé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le créneau');
            }
          }
        }
      ]
    );
  };

  const getCreneauxForJour = (jour) => {
    return creneaux.filter(c => c.jour === jour);
  };

  const renderJourCard = (jour) => {
    const jourCreneaux = getCreneauxForJour(jour.id);
    
    return (
      <View key={jour.id} style={styles.jourCard}>
        <View style={styles.jourHeader}>
          <Text style={styles.jourTitle}>{jour.label}</Text>
          <TouchableOpacity
            style={styles.addCreneauButton}
            onPress={() => handleOpenModal({ jour: jour.id })}
          >
            <Icon name="add" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        
        {jourCreneaux.length > 0 ? (
          jourCreneaux.map(creneau => (
            <View key={creneau.id} style={styles.creneauItem}>
              <View style={styles.creneauInfo}>
                <Text style={styles.creneauHeures}>
                  {creneau.heureDebut} - {creneau.heureFin}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: creneau.actif ? '#4CAF50' : '#F44336' }]}>
                  <Text style={styles.statusBadgeText}>
                    {creneau.actif ? 'Actif' : 'Inactif'}
                  </Text>
                </View>
              </View>
              <View style={styles.creneauActions}>
                <TouchableOpacity
                  style={styles.creneauAction}
                  onPress={() => handleOpenModal(creneau)}
                >
                  <Icon name="edit" size={18} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.creneauAction}
                  onPress={() => handleDeleteCreneau(creneau.id)}
                >
                  <Icon name="delete" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noCreneauxText}>Aucun créneau défini</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Créneaux horaires</Text>
          <Text style={styles.headerSubtitle}>{stylisteName}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color="#2196F3" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Définissez ici les créneaux de disponibilité du styliste. 
            Ces créneaux seront utilisés pour la prise de rendez-vous.
          </Text>
        </View>

        {joursSemaine.map(jour => renderJourCard(jour))}
      </ScrollView>

      {/* Modal pour ajouter/modifier un créneau */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCreneau ? 'Modifier le créneau' : 'Nouveau créneau'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Jour *</Text>
              <View style={styles.jourSelector}>
                {joursSemaine.map(jour => (
                  <TouchableOpacity
                    key={jour.id}
                    style={[
                      styles.jourOption,
                      formData.jour === jour.id && styles.jourOptionSelected
                    ]}
                    onPress={() => setFormData({...formData, jour: jour.id})}
                  >
                    <Text style={[
                      styles.jourOptionText,
                      formData.jour === jour.id && styles.jourOptionTextSelected
                    ]}>
                      {jour.label.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeGroup}>
                <Text style={styles.label}>Heure début</Text>
                <TextInput
                  style={styles.timeInput}
                  value={formData.heureDebut}
                  onChangeText={(text) => setFormData({...formData, heureDebut: text})}
                  placeholder="HH:MM"
                />
              </View>
              
              <Text style={styles.timeSeparator}>à</Text>
              
              <View style={styles.timeGroup}>
                <Text style={styles.label}>Heure fin</Text>
                <TextInput
                  style={styles.timeInput}
                  value={formData.heureFin}
                  onChangeText={(text) => setFormData({...formData, heureFin: text})}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.label}>Statut</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {formData.actif ? 'Actif' : 'Inactif'}
                </Text>
                <Switch
                  value={formData.actif}
                  onValueChange={(value) => setFormData({...formData, actif: value})}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={formData.actif ? '#2196F3' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveCreneau}
              >
                <Text style={styles.saveButtonText}>
                  {editingCreneau ? 'Mettre à jour' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FF9800'
  },
  backButton: {
    padding: 5
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2
  },
  headerRight: {
    width: 30
  },
  content: {
    flex: 1,
    padding: 15
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center'
  },
  infoIcon: {
    marginRight: 10
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1565C0'
  },
  jourCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  jourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  jourTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  addCreneauButton: {
    padding: 5
  },
  creneauItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginTop: 8
  },
  creneauInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  creneauHeures: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 10
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  creneauActions: {
    flexDirection: 'row'
  },
  creneauAction: {
    padding: 5,
    marginLeft: 5
  },
  noCreneauxText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  jourSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  jourOption: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center'
  },
  jourOptionSelected: {
    backgroundColor: '#FF9800'
  },
  jourOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666'
  },
  jourOptionTextSelected: {
    color: '#fff'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  timeGroup: {
    flex: 1
  },
  timeSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#666'
  },
  timeInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center'
  },
  switchGroup: {
    marginBottom: 30
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  switchLabel: {
    fontSize: 14,
    color: '#333'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#f5f5f5'
  },
  saveButton: {
    backgroundColor: '#4CAF50'
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default StylisteCreneauxScreen;