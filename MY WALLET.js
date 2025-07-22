import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, MaterialIcons, Feather } from '@expo/vector-icons'; // For icons

// --- Global Constants & Colors (Tailwind-like) ---
const AppColors = {
  primaryBlue: '#2563EB', // blue-600
  darkBlue: '#1D4ED8', // blue-700
  lightGray: '#F3F4F6', // gray-100
  mediumGray: '#6B7280', // gray-500
  darkText: '#1F2937', // gray-800
  greenProgress: '#22C55E', // green-500
  redError: '#EF4444', // red-500
  white: '#FFFFFF',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Utility Functions ---
const formatCurrency = (amount) => {
  return `UGX ${amount.toLocaleString('en-US')}`;
};

// --- Custom Message Box Component (replaces Alert) ---
const CustomAlert = ({ visible, title, message, onClose }) => {
  if (!visible) return null;

  return (
    <View style={styles.alertOverlay}>
      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <TouchableOpacity style={styles.alertButton} onPress={onClose}>
          <Text style={styles.alertButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- App State Context (Optional, but good for larger apps) ---
// For this example, we'll pass props down, but for a real app, Provider would be better.

// --- Splash Screen ---
function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate splash duration
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Auth');
      }
    };
    checkAuthAndNavigate();
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <Text style={styles.splashTitle}>MY WALLET</Text>
      <Text style={styles.splashTagline}>Your Smart AI Finance Partner</Text>
    </View>
  );
}

// --- Login Screen ---
function LoginScreen({ navigation, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (email === 'user@example.com' && password === 'password123') {
      await AsyncStorage.setItem('currentUser', JSON.stringify({ email }));
      setCurrentUser({ email }); // Update parent state
      navigation.replace('MainTabs');
    } else {
      setErrorMessage('Invalid email or password.');
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authHeaderTitle}>MY WALLET</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Login</Text>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <View style={styles.inputContainer}>
          <MaterialIcons name="mail-outline" size={20} color={AppColors.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email or Phone number"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock-outline" size={20} color={AppColors.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
          <Text style={styles.authButtonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.authFooter}>
          <Text style={styles.authFooterText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Register')}>
            <Text style={styles.authLinkText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// --- Register Screen ---
function RegisterScreen({ navigation, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    if (email && password && password.length >= 6) {
      await AsyncStorage.setItem('currentUser', JSON.stringify({ email }));
      setCurrentUser({ email }); // Update parent state
      navigation.replace('MainTabs');
    } else {
      setErrorMessage('Please enter a valid email and a password of at least 6 characters.');
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authHeaderTitle}>MY WALLET</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Register</Text>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <View style={styles.inputContainer}>
          <MaterialIcons name="mail-outline" size={20} color={AppColors.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock-outline" size={20} color={AppColors.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.authButton} onPress={handleRegister}>
          <Text style={styles.authButtonText}>Register</Text>
        </TouchableOpacity>
        <View style={styles.authFooter}>
          <Text style={styles.authFooterText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.authLinkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// --- Dashboard Screen ---
function DashboardScreen({ navigation, userBalance, monthlySpendingData, handleLogout, currentUser }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hi, {currentUser?.email ? currentUser.email.split('@')[0] : 'User'}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={16} color={AppColors.white} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.mainContent}>
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>My Balance</Text>
          <Text style={styles.balanceText}>{formatCurrency(userBalance)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Monthly Spending</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Monthly Spending Bar Chart (Placeholder)</Text>
            {/* In a real app, integrate a library like react-native-chart-kit here */}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Insights</Text>
          <Text style={styles.insightText}>
            "Looks like you're reaching the next goals. I recommend this week you allocate UGX 150,000 to car maintenance."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Wallet Screen ---
function WalletScreen({ navigation, vaults, setVaults, showMessageBox }) {
  const handleAddVault = () => {
    Alert.prompt(
      "Add New Vault",
      "Enter name for the new vault:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Next",
          onPress: (vaultName) => {
            if (vaultName && vaultName.trim() !== '') {
              Alert.prompt(
                `Goal for ${vaultName}`,
                `Enter goal amount for ${vaultName}:`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Set Goal",
                    onPress: (goalAmountStr) => {
                      const newVaultGoal = parseFloat(goalAmountStr);
                      if (!isNaN(newVaultGoal) && newVaultGoal > 0) {
                        setVaults(prevVaults => {
                          const newVault = { id: `vault-${Date.now()}`, name: vaultName, current: 0, goal: newVaultGoal };
                          const updatedVaults = [...prevVaults, newVault];
                          AsyncStorage.setItem('vaults', JSON.stringify(updatedVaults));
                          return updatedVaults;
                        });
                      } else {
                        showMessageBox('Invalid Input', "Please enter a valid positive goal amount for the vault.");
                      }
                    }
                  }
                ],
                'plain-text',
                '',
                'number-pad'
              );
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleUpdateVaultAmount = (vaultId, newAmount) => {
    setVaults(prevVaults => {
      const updatedVaults = prevVaults.map(vault =>
        vault.id === vaultId ? { ...vault, current: newAmount } : vault
      );
      AsyncStorage.setItem('vaults', JSON.stringify(updatedVaults));
      return updatedVaults;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="chevron-left" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WALLET</Text>
      </View>
      <ScrollView style={styles.mainContent}>
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>My Vault</Text>
          {vaults.length === 0 ? (
            <Text style={styles.emptyStateText}>No vaults added yet.</Text>
          ) : (
            vaults.map(vault => {
              const progress = (vault.current / vault.goal) * 100;
              // Use a ref for the TextInput to get its current value on update button press
              const vaultInputRef = useRef(null);
              useEffect(() => {
                if (vaultInputRef.current) {
                  vaultInputRef.current.setNativeProps({ text: vault.current.toString() });
                }
              }, [vault.current]); // Update input value when vault.current changes

              return (
                <View key={vault.id} style={styles.vaultItem}>
                  <View style={styles.vaultHeader}>
                    <Text style={styles.vaultName}>{vault.name}</Text>
                    <Text style={styles.vaultAmounts}>{formatCurrency(vault.current)} / {formatCurrency(vault.goal)}</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${Math.min(100, progress)}%` }]} />
                  </View>
                  <View style={styles.vaultUpdateRow}>
                    <TextInput
                      ref={vaultInputRef}
                      style={styles.vaultInput}
                      defaultValue={vault.current.toString()} // Use defaultValue for initial render
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        // This only updates the TextInput's internal value, not the state yet
                      }}
                    />
                    <TouchableOpacity
                      style={styles.vaultUpdateButton}
                      onPress={() => {
                        const newAmount = parseFloat(vaultInputRef.current.props.value || vaultInputRef.current.props.defaultValue);
                        if (!isNaN(newAmount) && newAmount >= 0) {
                          handleUpdateVaultAmount(vault.id, newAmount);
                        } else {
                          showMessageBox('Invalid Input', "Please enter a valid positive amount.");
                        }
                      }}
                    >
                      <Text style={styles.vaultUpdateButtonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          <TouchableOpacity style={styles.addVaultButton} onPress={handleAddVault}>
            <Text style={styles.addVaultButtonText}>Add New Vault</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Generate Card</Text>
          <TouchableOpacity
            style={styles.generateCardButton}
            onPress={() => showMessageBox('Card Generation', 'A new virtual card has been generated! (This is a simulation)')}
          >
            <Text style={styles.generateCardButtonText}>Generate card</Text>
            <MaterialCommunityIcons name="credit-card-outline" size={20} color={AppColors.darkText} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- XSpend Screen ---
function XSpendScreen({ navigation, spendingCategories, setSpendingCategories, userBalance, setUserBalance, showMessageBox }) {
  const totalSpending = Object.values(spendingCategories).reduce((sum, amount) => sum + amount, 0);

  const handleAddSpending = async () => {
    Alert.prompt(
      "Add New Spending",
      "Enter category and amount (e.g., Food, 50000):",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: (input) => {
            if (!input) {
              showMessageBox('Invalid Input', "Please enter a category and amount.");
              return;
            }
            const parts = input.split(',').map(s => s.trim());
            if (parts.length === 2) {
              const category = parts[0];
              const amount = parseFloat(parts[1]);
              if (category && !isNaN(amount) && amount > 0) {
                setSpendingCategories(prevCategories => {
                  const updatedCategories = {
                    ...prevCategories,
                    [category]: (prevCategories[category] || 0) + amount
                  };
                  AsyncStorage.setItem('spendingCategories', JSON.stringify(updatedCategories));
                  return updatedCategories;
                });
                setUserBalance(prevBalance => {
                  const newBalance = prevBalance - amount;
                  AsyncStorage.setItem('userBalance', newBalance.toString());
                  return newBalance;
                });
              } else {
                showMessageBox('Invalid Input', "Please enter a valid category and a positive amount.");
              }
            } else {
              showMessageBox('Invalid Input', "Please use format: Category, Amount (e.g., Food, 50000)");
            }
          }
        }
      ],
      'plain-text'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="chevron-left" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SMART SPENDING</Text>
      </View>
      <ScrollView style={styles.mainContent}>
        <View style={[styles.card, styles.centerContent]}>
          <Text style={styles.cardSectionTitle}>Upload Receipt</Text>
          <View style={styles.uploadIconContainer}>
            <Feather name="upload" size={40} color={AppColors.primaryBlue} />
          </View>
          <TouchableOpacity
            style={styles.uploadReceiptButton}
            onPress={() => showMessageBox('Receipt Upload', 'Receipt upload simulated. (No actual file selection)')}
          >
            <Text style={styles.uploadReceiptButtonText}>Upload Receipt</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Spending by Category</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Spending Pie Chart (Placeholder)</Text>
            {/* In a real app, integrate a library like react-native-chart-kit here */}
          </View>
          <View style={styles.spendingSummary}>
            {totalSpending === 0 ? (
              <Text style={styles.emptyStateText}>No spending recorded yet. Add some spending!</Text>
            ) : (
              Object.entries(spendingCategories).map(([category, amount]) => (
                <View key={category} style={styles.spendingSummaryItem}>
                  <Text style={styles.spendingSummaryCategory}>{category}</Text>
                  <Text style={styles.spendingSummaryAmount}>
                    {formatCurrency(amount)} ({((amount / totalSpending) * 100).toFixed(1)}%)
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.addSpendingSection}>
            <Text style={styles.addSpendingTitle}>Add New Spending</Text>
            <TouchableOpacity style={styles.addSpendingButton} onPress={handleAddSpending}>
              <Text style={styles.addSpendingButtonText}>Add Spending</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- AI Chatbot Screen ---
function ChatScreen({ navigation, userBalance, spendingCategories, vaults, chatHistory, setChatHistory }) {
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    // Scroll to bottom when chat history updates
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory, isTyping]);

  const handleChatSubmit = async () => {
    const userMessageText = chatInput.trim();
    if (!userMessageText) return;

    setChatHistory(prev => [...prev, { role: 'user', message: userMessageText }]);
    setChatInput('');
    setIsTyping(true);
    await AsyncStorage.setItem('chatHistory', JSON.stringify([...chatHistory, { role: 'user', message: userMessageText }]));

    const lowerCaseMessage = userMessageText.toLowerCase();
    let botReply = "I'm not sure how to respond to that. Can you ask about your balance, spending, vaults, or for financial advice?";

    // AI Logic based on provided query arrays
    // 1. Balance Queries
    const balanceQueries = [
      "what’s my balance?", "how much money do i have?", "check my wallet",
      "total funds available", "show me my cash", "my current balance"
    ];
    if (balanceQueries.some(query => lowerCaseMessage.includes(query.toLowerCase()))) {
      botReply = `Your current balance is ${formatCurrency(userBalance)}.`;
    }
    // 2. Spending Queries
    else if (lowerCaseMessage.includes('how much have i spent this month?') ||
             lowerCaseMessage.includes('break down my spending') ||
             lowerCaseMessage.includes('what did i spend the most on?') ||
             lowerCaseMessage.includes('show me my expenses') ||
             lowerCaseMessage.includes('where is most of my money going?') ||
             lowerCaseMessage.includes('spent')) {
        const totalSpending = Object.values(spendingCategories).reduce((sum, amount) => sum + amount, 0);
        if (totalSpending > 0) {
            let spendingBreakdown = `Your total spending is ${formatCurrency(totalSpending)}. Here's a breakdown by category:\n`;
            const sortedCategories = Object.entries(spendingCategories).sort(([, a], [, b]) => b - a);
            sortedCategories.forEach(([category, amount]) => {
                spendingBreakdown += `- ${category}: ${formatCurrency(amount)}\n`;
            });
            botReply = spendingBreakdown.trim();
        } else {
            botReply = "You haven't recorded any spending yet this month.";
        }
    }
    // 3. Financial Advice Queries
    else if (lowerCaseMessage.includes('recommend a savings plan') ||
             lowerCaseMessage.includes('what should i do with my money?') ||
             lowerCaseMessage.includes('any suggestions?') ||
             lowerCaseMessage.includes('advise me financially')) {
        if (userBalance > 20000000) {
            botReply = "With your current balance, I recommend exploring investment opportunities or setting up a new, ambitious savings goal in your 'My Vault' section!";
        } else if (Object.values(spendingCategories).reduce((sum, amount) => sum + amount, 0) > userBalance * 0.4) {
            botReply = "It seems your spending is quite high relative to your balance. Consider reviewing your 'XSpend' categories to identify areas where you can cut back, especially on non-essentials.";
        } else {
            botReply = "To improve your finances, always track your spending diligently and try to allocate a portion of your income to your savings vaults regularly.";
        }
    }
    // 4. Vault Status Queries
    else if (lowerCaseMessage.includes('what’s my rent vault status?') ||
             lowerCaseMessage.includes('how much saved for emergencies?') ||
             lowerCaseMessage.includes('progress on savings?') ||
             lowerCaseMessage.includes('vaults status') ||
             lowerCaseMessage.includes('goal achievements')) {
        if (vaults.length > 0) {
            let vaultStatus = "Here's the status of your vaults:\n";
            vaults.forEach(vault => {
                const progress = (vault.current / vault.goal) * 100;
                vaultStatus += `- ${vault.name}: ${formatCurrency(vault.current)} of ${formatCurrency(vault.goal)} (${progress.toFixed(1)}% complete).\n`;
            });
            botReply = vaultStatus.trim();
        } else {
            botReply = "You haven't set up any vaults yet. Go to the 'Wallet' section to create some savings goals!";
        }
    }
    // 5. Add Expense/Receipt Queries (Simulated)
    else if (lowerCaseMessage.includes('upload this receipt') ||
             lowerCaseMessage.includes('add new expense') ||
             lowerCaseMessage.includes('scan this bill') ||
             lowerCaseMessage.includes('log my spending')) {
        botReply = "To add an expense or upload a receipt, please navigate to the 'XSpend' tab. You can manually add spending there.";
        // Attempt to parse specific spending if mentioned
        const match = lowerCaseMessage.match(/i bought (.+) for ugx ([\d,]+)/);
        if (match) {
            const item = match[1].trim();
            const amount = parseFloat(match[2].replace(/,/g, ''));
            if (!isNaN(amount) && amount > 0) {
                botReply += ` I can see you mentioned buying "${item}" for ${formatCurrency(amount)}. You can add this in the XSpend section!`;
            }
        }
    }
    // 6. Greetings and General Queries
    else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        botReply = "Hello there! How can I help you with your finances today?";
    } else if (lowerCaseMessage.includes('thanks') || lowerCaseMessage.includes('thank you')) {
        botReply = "You're most welcome! Is there anything else I can assist you with?";
    } else if (lowerCaseMessage.includes('who are you?')) {
        botReply = "I am My Wallet AI, your smart finance partner, here to help you manage your money.";
    } else if (lowerCaseMessage.includes('what can you help with?')) {
        botReply = "I can tell you your balance, summarize your spending, update you on your savings goals, and offer financial advice. Just ask!";
    }

    // Simulate AI processing time
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => {
        const newHistory = [...prev, { role: 'bot', message: botReply }];
        AsyncStorage.setItem('chatHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="chevron-left" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI CHAT</Text>
      </View>
      <View style={styles.chatContent}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatMessagesContainer}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {chatHistory.map((msg, index) => (
            <View key={index} style={[
              styles.chatBubbleWrapper,
              msg.role === 'user' ? styles.chatBubbleUserWrapper : styles.chatBubbleBotWrapper
            ]}>
              <View style={[
                styles.chatBubble,
                msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot
              ]}>
                <Text style={msg.role === 'user' ? styles.chatBubbleUserText : styles.chatBubbleBotText}>
                  {msg.message}
                </Text>
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.chatBubbleWrapper, styles.chatBubbleBotWrapper]}>
              <View style={[styles.chatBubble, styles.chatBubbleBot]}>
                <ActivityIndicator size="small" color={AppColors.darkText} />
                <Text style={styles.chatBubbleBotText}>Typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Type your message..."
            editable={!isTyping}
          />
          <TouchableOpacity
            style={styles.chatSendButton}
            onPress={handleChatSubmit}
            disabled={isTyping || chatInput.trim() === ''}
          >
            <MaterialIcons name="send" size={24} color={AppColors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- Main App Component ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userBalance, setUserBalance] = useState(29370000);
  const [monthlySpendingData, setMonthlySpendingData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    data: [5000000, 7000000, 4500000, 6000000]
  });
  const [spendingCategories, setSpendingCategories] = useState({
    'Food': 3000000,
    'Transport': 1500000,
    'Bills': 2000000,
    'Entertainment': 1000000
  });
  const [vaults, setVaults] = useState([
    { id: 'rent', name: 'Rent', current: 500000, goal: 1000000 },
    { id: 'emergency', name: 'Emergency Funds', current: 200000, goal: 500000 }
  ]);
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', message: 'Hey, how can I assist you?' }
  ]);
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '' });

  const showCustomMessageBox = (title, message) => {
    setMessageBoxContent({ title, message });
    setMessageBoxVisible(true);
  };

  const hideCustomMessageBox = () => {
    setMessageBoxVisible(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      const storedBalance = await AsyncStorage.getItem('userBalance');
      if (storedBalance) setUserBalance(parseFloat(storedBalance));

      const storedSpendingData = await AsyncStorage.getItem('monthlySpendingData');
      if (storedSpendingData) setMonthlySpendingData(JSON.parse(storedSpendingData));

      const storedCategories = await AsyncStorage.getItem('spendingCategories');
      if (storedCategories) setSpendingCategories(JSON.parse(storedCategories));

      const storedVaults = await AsyncStorage.getItem('vaults');
      if (storedVaults) setVaults(JSON.parse(storedVaults));

      const storedChatHistory = await AsyncStorage.getItem('chatHistory');
      if (storedChatHistory) setChatHistory(JSON.parse(storedChatHistory));
    };
    loadInitialData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    setCurrentUser(null);
    // Navigation will be handled by the Stack Navigator
  };

  // --- Tab Navigator Screens ---
  const DashboardTabScreen = (props) => (
    <DashboardScreen
      {...props}
      userBalance={userBalance}
      monthlySpendingData={monthlySpendingData}
      handleLogout={handleLogout}
      currentUser={currentUser}
    />
  );

  const WalletTabScreen = (props) => (
    <WalletScreen
      {...props}
      vaults={vaults}
      setVaults={setVaults}
      showMessageBox={showCustomMessageBox}
    />
  );

  const XSpendTabScreen = (props) => (
    <XSpendScreen
      {...props}
      spendingCategories={spendingCategories}
      setSpendingCategories={setSpendingCategories}
      userBalance={userBalance}
      setUserBalance={setUserBalance}
      showMessageBox={showCustomMessageBox}
    />
  );

  const ChatTabScreen = (props) => (
    <ChatScreen
      {...props}
      userBalance={userBalance}
      spendingCategories={spendingCategories}
      vaults={vaults}
      chatHistory={chatHistory}
      setChatHistory={setChatHistory}
    />
  );

  function MainTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // Hide default header for tabs
          tabBarActiveTintColor: AppColors.primaryBlue,
          tabBarInactiveTintColor: AppColors.mediumGray,
          tabBarStyle: {
            backgroundColor: AppColors.white,
            borderTopWidth: 1,
            borderTopColor: AppColors.gray200,
            paddingBottom: Platform.OS === 'ios' ? 20 : 5, // Adjust padding for iOS notch
            height: Platform.OS === 'ios' ? 80 : 60, // Adjust height for iOS notch
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'HomeTab') {
              iconName = 'home';
            } else if (route.name === 'WalletTab') {
              iconName = 'wallet';
            } else if (route.name === 'XSpendTab') {
              iconName = 'chart-pie'; // Using MaterialCommunityIcons for pie chart
            } else if (route.name === 'ChatTab') {
              iconName = 'chat';
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={DashboardTabScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="WalletTab" component={WalletTabScreen} options={{ title: 'Wallet' }} />
        <Tab.Screen name="XSpendTab" component={XSpendTabScreen} options={{ title: 'XSpend' }} />
        <Tab.Screen name="ChatTab" component={ChatTabScreen} options={{ title: 'Chat' }} />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth">
          {(props) => <AuthStack {...props} setCurrentUser={setCurrentUser} />}
        </Stack.Screen>
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
      <CustomAlert
        visible={messageBoxVisible}
        title={messageBoxContent.title}
        message={messageBoxContent.message}
        onClose={hideCustomMessageBox}
      />
    </NavigationContainer>
  );
}

// Nested Auth Stack for Login/Register
function AuthStack({ setCurrentUser }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} setCurrentUser={setCurrentUser} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} setCurrentUser={setCurrentUser} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.lightGray,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.primaryBlue,
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: AppColors.white,
    marginBottom: 10,
  },
  splashTagline: {
    fontSize: 18,
    color: AppColors.white,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.primaryBlue,
    padding: 16,
  },
  authHeaderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.white,
    marginBottom: 40,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5, // For Android shadow
    marginBottom: 16, // Added for spacing between cards
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: AppColors.darkText,
  },
  errorText: {
    color: AppColors.redError,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.gray300,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: AppColors.darkText,
    fontSize: 16,
  },
  authButton: {
    width: '100%',
    backgroundColor: AppColors.primaryBlue,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  authFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  authFooterText: {
    fontSize: 14,
    color: AppColors.mediumGray,
  },
  authLinkText: {
    fontSize: 14,
    color: AppColors.primaryBlue,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  header: {
    backgroundColor: AppColors.primaryBlue,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.white,
  },
  backButton: {
    paddingRight: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.darkBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.darkText,
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: AppColors.primaryBlue,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: AppColors.gray200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    color: AppColors.mediumGray,
    fontSize: 14,
  },
  insightText: {
    color: AppColors.mediumGray,
    fontSize: 14,
  },
  emptyStateText: {
    color: AppColors.mediumGray,
    textAlign: 'center',
    paddingVertical: 16,
  },
  vaultItem: {
    backgroundColor: AppColors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.gray200,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaultName: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.darkText,
  },
  vaultAmounts: {
    fontSize: 14,
    color: AppColors.mediumGray,
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: AppColors.gray200,
    borderRadius: 9999,
    height: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: AppColors.greenProgress,
    borderRadius: 9999,
  },
  vaultUpdateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  vaultInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppColors.gray300,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    color: AppColors.darkText,
    height: 40, // Fixed height for consistency
  },
  vaultUpdateButton: {
    backgroundColor: AppColors.primaryBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  vaultUpdateButtonText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  addVaultButton: {
    backgroundColor: AppColors.primaryBlue,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addVaultButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  generateCardButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.gray200,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  generateCardButtonText: {
    color: AppColors.darkText,
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: AppColors.primaryBlue + '1A', // blue-100 with opacity
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadReceiptButton: {
    backgroundColor: AppColors.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadReceiptButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  spendingSummary: {
    marginTop: 16,
    paddingVertical: 8,
  },
  spendingSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spendingSummaryCategory: {
    fontSize: 14,
    color: AppColors.darkText,
  },
  spendingSummaryAmount: {
    fontSize: 14,
    color: AppColors.mediumGray,
  },
  addSpendingSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: AppColors.gray200,
    paddingTop: 24,
  },
  addSpendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: AppColors.darkText,
  },
  addSpendingButton: {
    backgroundColor: AppColors.primaryBlue,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addSpendingButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  chatContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0, // Footer takes care of bottom padding
  },
  chatMessagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end', // Align messages to bottom
  },
  chatBubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chatBubbleUserWrapper: {
    justifyContent: 'flex-end',
  },
  chatBubbleBotWrapper: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row', // For typing indicator
    alignItems: 'center', // For typing indicator
  },
  chatBubbleUser: {
    backgroundColor: AppColors.primaryBlue,
    borderBottomRightRadius: 4,
  },
  chatBubbleBot: {
    backgroundColor: AppColors.gray200,
    borderBottomLeftRadius: 4,
  },
  chatBubbleUserText: {
    color: AppColors.white,
    fontSize: 14,
    lineHeight: 20, // To match web text line height
  },
  chatBubbleBotText: {
    color: AppColors.darkText,
    fontSize: 14,
    lineHeight: 20, // To match web text line height
    marginLeft: 5, // For typing indicator
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.gray200,
    padding: 16,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppColors.gray300,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    color: AppColors.darkText,
    backgroundColor: AppColors.gray100, // Light background for input
  },
  chatSendButton: {
    backgroundColor: AppColors.primaryBlue,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Custom Alert Box Styles
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: AppColors.white,
    padding: 24,
    borderRadius: 16,
    width: '85%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: AppColors.darkText,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: AppColors.mediumGray,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: AppColors.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  alertButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
