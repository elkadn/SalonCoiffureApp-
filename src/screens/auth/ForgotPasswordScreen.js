import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ForgotPasswordScreen = ({ navigation }) => {
  const adminPhone = "+212 6XX-XXXXXX"; 
  const adminEmail = "admin@salon-coiffure.com"; 

  const handleCallAdmin = () => {
    Alert.alert(
      "Appeler l'administrateur",
      `Voulez-vous appeler le numéro ${adminPhone} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Appeler", 
          onPress: () => Linking.openURL(`tel:${adminPhone.replace(/\s/g, '')}`)
        }
      ]
    );
  };

  const handleEmailAdmin = () => {
    Alert.alert(
      "Contacter par email",
      `Voulez-vous envoyer un email à ${adminEmail} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Envoyer", 
          onPress: () => Linking.openURL(`mailto:${adminEmail}?subject=Récupération mot de passe&body=Bonjour, j'ai oublié mon mot de passe. Pouvez-vous le réinitialiser s'il vous plaît ?`)
        }
      ]
    );
  };

  const handleWhatsAppAdmin = () => {
    const message = "Bonjour, j'ai oublié mon mot de passe. Pouvez-vous le réinitialiser s'il vous plaît ?";
    const url = `https://wa.me/${adminPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    Alert.alert(
      "Contacter sur WhatsApp",
      `Voulez-vous contacter l'administrateur sur WhatsApp ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Ouvrir WhatsApp", 
          onPress: () => Linking.openURL(url).catch(() => 
            Alert.alert("Erreur", "WhatsApp n'est pas installé sur votre appareil")
          )
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mot de passe oublié</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="lock" size={80} color="#4CAF50" />
        </View>

        <Text style={styles.title}>Besoin d'aide ?</Text>
        
        <Text style={styles.description}>
          Pour des raisons de sécurité, la réinitialisation du mot de passe est gérée manuellement par l'administrateur.
        </Text>

        <View style={styles.infoCard}>
          <Icon name="info" size={24} color="#2196F3" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Contactez l'administrateur du salon pour réinitialiser votre mot de passe.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contactez l'administrateur :</Text>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleCallAdmin}>
            <View style={[styles.contactIcon, { backgroundColor: "#4CAF50" }]}>
              <Icon name="phone" size={24} color="#fff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Par téléphone</Text>
              <Text style={styles.contactValue}>{adminPhone}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleEmailAdmin}>
            <View style={[styles.contactIcon, { backgroundColor: "#2196F3" }]}>
              <Icon name="email" size={24} color="#fff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Par email</Text>
              <Text style={styles.contactValue}>{adminEmail}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsAppAdmin}>
            <View style={[styles.contactIcon, { backgroundColor: "#25D366" }]}>
              <Icon name="chat" size={24} color="#fff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Sur WhatsApp</Text>
              <Text style={styles.contactValue}>Message direct</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Ce que vous devez faire :</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Contactez l'administrateur par l'un des moyens ci-dessus</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Présentez-vous et précisez votre email de connexion</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>L'administrateur réinitialisera votre mot de passe</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>Vous recevrez un nouveau mot de passe temporaire</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Icon name="security" size={20} color="#FF9800" />
          <Text style={styles.noteText}>
            Pour des raisons de sécurité, nous ne pouvons pas vous envoyer de lien de réinitialisation automatique.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButtonLarge}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#4CAF50" />
          <Text style={styles.backButtonText}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 20,
  },
  contactSection: {
    marginBottom: 25,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  instructionsCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  noteBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#E65100",
    marginLeft: 10,
    lineHeight: 18,
  },
  backButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  backButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default ForgotPasswordScreen;