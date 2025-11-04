import axiosClient from '../../../api/axiosClient';

/**
 * Chat API Service
 * Quản lý tất cả các API calls liên quan đến chat
 */

const chatApi = {
  /**
   * Khởi tạo conversation và tự động phân công staff
   * Backend sẽ tự động assign một staff available
   * @returns {Promise} - { conversationId, staffId, staffName, staffAvatar }
   */
  startConversation: () => {
    const url = '/chat/conversation/start';
    return axiosClient.post(url);
  },

  /**
   * Lấy danh sách tất cả các cuộc hội thoại của user hiện tại
   * @returns {Promise} - Danh sách conversations
   */
  getConversations: () => {
    const url = '/chat/conversations';
    return axiosClient.get(url);
  },

  /**
   * Lấy tất cả tin nhắn trong một cuộc hội thoại
   * @param {number} conversationId - ID của cuộc hội thoại
   * @returns {Promise} - Danh sách messages
   */
  getMessages: (conversationId) => {
    const url = `/chat/conversation/${conversationId}/messages`;
    return axiosClient.get(url);
  },

  /**
   * Gửi tin nhắn mới (sử dụng HTTP, không phải WebSocket)
   * Backup method nếu WebSocket không khả dụng
   * @param {object} messageData - {receiverId, content}
   * @returns {Promise} - Message đã gửi
   */
  sendMessage: (messageData) => {
    const url = '/chat/send';
    return axiosClient.post(url, messageData);
  },

  /**
   * Đánh dấu tin nhắn đã đọc
   * @param {number} conversationId - ID của cuộc hội thoại
   * @returns {Promise}
   */
  markAsRead: (conversationId) => {
    const url = `/chat/conversation/${conversationId}/read`;
    return axiosClient.put(url);
  },

  /**
   * Xóa tin nhắn
   * @param {number} messageId - ID của tin nhắn cần xóa
   * @returns {Promise}
   */
  deleteMessage: (messageId) => {
    const url = `/chat/message/${messageId}`;
    return axiosClient.delete(url);
  },

  /**
   * Tạo cuộc hội thoại mới
   * @param {number} userId - ID của user muốn chat
   * @returns {Promise} - Conversation mới
   */
  createConversation: (userId) => {
    const url = '/chat/conversation';
    return axiosClient.post(url, { userId });
  },

  /**
   * Lấy thông tin user theo ID (để hiển thị tên, avatar trong chat)
   * @param {number} userId - ID của user
   * @returns {Promise} - User info
   */
  getUserInfo: (userId) => {
    const url = `/users/${userId}`;
    return axiosClient.get(url);
  },
};

export default chatApi;
