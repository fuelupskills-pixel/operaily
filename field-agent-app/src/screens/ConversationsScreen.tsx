import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockConversations = [
  { id: '1', name: 'Hans Mueller', lastMessage: 'Yes, I would be interested in a meeting.', time: '2m', unread: 2, channel: 'whatsapp' },
  { id: '2', name: 'Dr. Anna Weber', lastMessage: 'Thank you for the video.', time: '1h', unread: 1, channel: 'email' },
  { id: '3', name: 'Klaus Schmidt', lastMessage: 'AI Voice Call completed', time: '3h', unread: 0, channel: 'voice' },
];

const mockMessages = [
  { id: '1', text: 'Hello! I saw your automated outreach.', isUser: false },
  { id: '2', text: 'Hi Hans! Yes, we build customized AI workflows.', isUser: true },
];

export function ConversationsScreen() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const renderConversationItem = ({ item }: { item: typeof mockConversations[0] }) => (
    <TouchableOpacity style={styles.convItem} onPress={() => setActiveChat(item.id)}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.convInfo}>
        <View style={styles.convHeader}>
          <Text style={styles.convName}>{item.name}</Text>
          <Text style={styles.convTime}>{item.time}</Text>
        </View>
        <View style={styles.convFooter}>
          <Text style={styles.convLastMessage} numberOfLines={1}>
            {item.channel === 'whatsapp' && <Ionicons name="logo-whatsapp" size={12} color="#25D366" />} {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (activeChat) {
    const chat = mockConversations.find(c => c.id === activeChat);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#3b82f6" />
            <Text style={styles.backText}>Inbox</Text>
          </TouchableOpacity>
          <Text style={styles.chatTitle}>{chat?.name}</Text>
        </View>
        <FlatList
          data={mockMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.leadBubble]}>
              <Text style={[styles.messageText, item.isUser ? styles.userText : styles.leadText]}>{item.text}</Text>
            </View>
          )}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.aiBtn}>
              <Ionicons name="sparkles" size={20} color="#a855f7" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendBtn}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
      </View>
      <FlatList
        data={mockConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  listContent: { paddingBottom: 20 },
  separator: { height: 1, backgroundColor: '#1a1a1a' },
  convItem: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e3a8a', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  convInfo: { flex: 1 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  convTime: { color: '#888', fontSize: 12 },
  convFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convLastMessage: { color: '#aaa', fontSize: 14, flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: '#3b82f6', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  // Chat styles
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  backText: { color: '#3b82f6', fontSize: 16 },
  chatTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  messageList: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#3b82f6', borderBottomRightRadius: 4 },
  leadBubble: { alignSelf: 'flex-start', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15 },
  userText: { color: '#fff' },
  leadText: { color: '#eee' },
  
  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#333', alignItems: 'center' },
  aiBtn: { padding: 10, marginRight: 8, backgroundColor: '#1a1a1a', borderRadius: 20 },
  input: { flex: 1, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 15 },
  sendBtn: { padding: 10, marginLeft: 8, backgroundColor: '#3b82f6', borderRadius: 20 },
});
