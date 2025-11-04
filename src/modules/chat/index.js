/**
 * Chat Module - Export tất cả components và hooks
 * Giúp import dễ dàng hơn từ các module khác
 */

// Pages
export { default as CustomerChatPage } from './pages/CustomerChatPage';
export { default as StaffChatPage } from './pages/StaffChatPage';

// Components
export { default as ConversationList } from './components/ConversationList';
export { default as ChatHeader } from './components/ChatHeader';
export { default as MessageList } from './components/MessageList';
export { default as MessageInput } from './components/MessageInput';

// Hooks
export { useChat } from './hooks/useChat';
export { useWebSocket } from './hooks/useWebSocket';

// Services
export { default as chatApi } from './services/chatApi';
export { default as websocketService } from './services/websocketService';
