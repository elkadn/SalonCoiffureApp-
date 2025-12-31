import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import orderService from '../../../services/orderService';
import { Picker } from '@react-native-picker/picker';

const OrderDetail = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Charger les détails de la commande
  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
      if (data) {
        setNewStatus(data.status);
      }
    } catch (error) {
      console.error('Erreur chargement détails commande:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la commande');
    } finally {
      setLoading(false);
    }
  };

  // Formater la date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'hourglass-empty';
      case 'confirmed': return 'check-circle';
      case 'delivered': return 'local-shipping';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  // Confirmer la suppression
  const confirmDelete = () => {
    Alert.alert(
      'Supprimer la commande',
      `Êtes-vous sûr de vouloir supprimer la commande ${order?.orderNumber} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: handleDelete
        }
      ]
    );
  };

  // Supprimer la commande
  const handleDelete = async () => {
    try {
      await orderService.deleteOrder(orderId);
      Alert.alert('Succès', 'Commande supprimée avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la commande');
    }
  };

  // Mettre à jour le statut
  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order?.status) {
      Alert.alert('Information', 'Aucun changement de statut');
      setShowStatusModal(false);
      return;
    }

    try {
      setUpdatingStatus(true);
      await orderService.updateOrderStatus(orderId, newStatus, statusNotes);
      
      // Recharger les données
      await loadOrderDetails();
      
      Alert.alert('Succès', 'Statut mis à jour avec succès');
      setShowStatusModal(false);
      setStatusNotes('');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Confirmer réception (livraison)
  const confirmDelivery = () => {
    Alert.alert(
      'Confirmer la livraison',
      'Êtes-vous sûr de vouloir marquer cette commande comme livrée ?\n\nCette action mettra à jour les stocks.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            setNewStatus('delivered');
            handleUpdateStatus();
          }
        }
      ]
    );
  };

  // Afficher les boutons d'action selon le statut
  const renderActionButtons = () => {
    if (!order) return null;

    return (
      <View style={styles.actionButtons}>
        {order.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={() => {
              setNewStatus('confirmed');
              setShowStatusModal(true);
            }}
          >
            <Icon name="check-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Confirmer</Text>
          </TouchableOpacity>
        )}

        {order.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={confirmDelivery}
          >
            <Icon name="local-shipping" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Marquer comme livré</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
          onPress={() => setShowStatusModal(true)}
        >
          <Icon name="swap-vert" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Changer statut</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => navigation.navigate('OrderEdit', { orderId: order.id })}
        >
          <Icon name="edit" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Rendu d'un produit
  const renderProductItem = (item, index) => (
    <View key={item.productId || index} style={styles.productItem}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productCode}>{item.productCode}</Text>
      </View>
      
      <View style={styles.productDetails}>
        <View style={styles.productRow}>
          <Text style={styles.productLabel}>Quantité:</Text>
          <Text style={styles.productValue}>{item.quantity}</Text>
        </View>
        
        <View style={styles.productRow}>
          <Text style={styles.productLabel}>Prix unitaire:</Text>
          <Text style={styles.productValue}>{item.unitPrice?.toFixed(2)} €</Text>
        </View>
        
        <View style={styles.productRow}>
          <Text style={styles.productLabel}>Total:</Text>
          <Text style={[styles.productValue, styles.productTotal]}>
            {item.totalPrice?.toFixed(2)} €
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails Commande</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails Commande</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error" size={60} color="#F44336" />
          <Text style={styles.errorText}>Commande non trouvée</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails Commande</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={confirmDelete}
        >
          <Icon name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Carte de statut */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(order.status) }]}>
            <Icon name={getStatusIcon(order.status)} size={30} color="#fff" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
            <Text style={styles.orderDate}>
              Créée le {formatDate(order.orderDate)}
            </Text>
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.infoRow}>
            <Icon name="local-shipping" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fournisseur</Text>
              <Text style={styles.infoValue}>{order.supplierName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar-today" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date commande</Text>
              <Text style={styles.infoValue}>{formatDate(order.orderDate)}</Text>
            </View>
          </View>

          {order.expectedDeliveryDate && (
            <View style={styles.infoRow}>
              <Icon name="date-range" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Livraison prévue</Text>
                <Text style={styles.infoValue}>{formatDate(order.expectedDeliveryDate)}</Text>
              </View>
            </View>
          )}

          {order.notes && (
            <View style={styles.infoRow}>
              <Icon name="notes" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.infoValue}>{order.notes}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Produits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produits</Text>
            <Text style={styles.itemCount}>{order.itemCount || 0} articles</Text>
          </View>

          {order.items && order.items.length > 0 ? (
            <View style={styles.productsList}>
              {order.items.map(renderProductItem)}
            </View>
          ) : (
            <View style={styles.emptyProducts}>
              <Icon name="shopping-cart" size={40} color="#ccc" />
              <Text style={styles.emptyProductsText}>Aucun produit</Text>
            </View>
          )}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total commande</Text>
            <Text style={styles.totalAmount}>{order.totalAmount?.toFixed(2) || '0.00'} €</Text>
          </View>
        </View>

        {/* Actions */}
        {renderActionButtons()}
      </ScrollView>

      {/* Modal de changement de statut */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer le statut</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Nouveau statut</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newStatus}
                  onValueChange={setNewStatus}
                  style={styles.picker}
                >
                  <Picker.Item label="En attente" value="pending" />
                  <Picker.Item label="Confirmée" value="confirmed" />
                  <Picker.Item label="Livrée" value="delivered" />
                  <Picker.Item label="Annulée" value="cancelled" />
                </Picker>
              </View>

              <Text style={styles.modalLabel}>Notes (optionnel)</Text>
              <View style={styles.notesInputContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={statusNotes}
                  onChangeText={setStatusNotes}
                  placeholder="Raison du changement de statut..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowStatusModal(false)}
                  disabled={updatingStatus}
                >
                  <Text style={styles.modalButtonCancelText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleUpdateStatus}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonConfirmText}>Mettre à jour</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 5,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statusInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  productsList: {
    marginBottom: 20,
  },
  productItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  productCode: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  productDetails: {
    marginLeft: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  productLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  productValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  productTotal: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: 'bold',
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '48%',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  notesInputContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 80,
  },
  notesInput: {
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalButtonConfirm: {
    backgroundColor: '#FF5722',
  },
  modalButtonCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetail;