package com.nt.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class LeaveRequestHandler extends TextWebSocketHandler {
    private final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        System.out.println("New WebSocket connection established: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        System.out.println("Received message from client: " + message.getPayload());
        for (WebSocketSession s : sessions) {
            s.sendMessage(message);
        }
    }

    public void notifyManager(String message) throws IOException {
        System.out.println("Sending notification: " + message); // Log the message being sent
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) { // Check if the session is open before sending
                s.sendMessage(new TextMessage(message));
            }
        }
    }

    // Example method to update leave request
    public void updateLeaveRequest(String leaveRequestId, String status) {
        // Logic to update the leave request in the database
        // For example, update the status in the database here
        System.out.println("Updating leave request " + leaveRequestId + " to status: " + status);

        // Notify all connected clients
        try {
            notifyManager("Leave request " + leaveRequestId + " updated to: " + status);
        } catch (IOException e) {
            System.err.println("Error sending notification: " + e.getMessage());
        }
    }

    // Example method to approve a leave request
    public void approveLeaveRequest(String leaveRequestId) {
        // Logic to approve the leave request
        // For example, update the status in the database here
        System.out.println("Approving leave request " + leaveRequestId);

        // Notify all connected clients
        try {
            notifyManager("Leave request " + leaveRequestId + " has been approved.");
        } catch (IOException e) {
            System.err.println("Error sending notification: " + e.getMessage());
        }
    }

    // Example method to reject a leave request
    public void rejectLeaveRequest(String leaveRequestId) {
        // Logic to reject the leave request
        // For example, update the status in the database here
        System.out.println("Rejecting leave request " + leaveRequestId);

        // Notify all connected clients
        try {
            notifyManager("Leave request " + leaveRequestId + " has been rejected.");
        } catch (IOException e) {
            System.err.println("Error sending notification: " + e.getMessage());
        }
    }
}