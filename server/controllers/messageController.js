import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    // Find all messages involving current user
    const allMessages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    // Group by conversation partner
    const partnerMap = new Map();

    for (const msg of allMessages) {
      const senderId = (msg.sender?._id || msg.sender).toString();
      const recipientId = (msg.recipient?._id || msg.recipient).toString();
      const partnerId = senderId === currentUserId ? recipientId : senderId;

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          lastMessage: msg,
          unreadCount: (recipientId === currentUserId && !msg.read) ? 1 : 0
        });
      } else {
        if (recipientId === currentUserId && !msg.read) {
          partnerMap.get(partnerId).unreadCount++;
        }
      }
    }

    // Populate partner details
    const conversations = [];
    for (const [partnerId, data] of partnerMap.entries()) {
      const partnerUser = await User.findById(partnerId);
      if (partnerUser) {
        conversations.push({
          partner: {
            _id: partnerUser._id,
            name: partnerUser.name,
            avatar: partnerUser.avatar,
            roles: partnerUser.roles,
            location: partnerUser.location
          },
          lastMessage: data.lastMessage,
          unreadCount: data.unreadCount
        });
      }
    }

    res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: partnerId },
        { sender: partnerId, recipient: currentUserId }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')
    .sort({ createdAt: 1 });

    // Mark unread messages sent to me as read
    for (const m of messages) {
      if ((m.recipient?._id || m.recipient).toString() === currentUserId.toString() && !m.read) {
        await Message.findByIdAndUpdate(m._id, { read: true });
        m.read = true;
      }
    }

    const partner = await User.findById(partnerId);
    let partnerSanitized = null;
    if (partner) {
      partnerSanitized = { ...partner };
      delete partnerSanitized.password;
    }

    res.status(200).json({ success: true, partner: partnerSanitized, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, text, projectId } = req.body;

    if (!recipientId || !text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Recipient and text are required.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found.' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text,
      projectId: projectId || null,
      read: false
    });

    // Notify recipient
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: 'message',
      title: `New message from ${req.user.name}`,
      message: text.substring(0, 80) + (text.length > 80 ? '...' : ''),
      link: `/messages?user=${req.user._id}`
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
