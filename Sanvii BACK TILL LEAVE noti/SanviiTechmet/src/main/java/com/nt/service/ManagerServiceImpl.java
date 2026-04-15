package com.nt.service;

import com.nt.Impl.ManagerService;
import com.nt.entity.LeaveRequest;
import com.nt.handler.LeaveRequestHandler;
import com.nt.repository.LeaveRequestRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ManagerServiceImpl implements ManagerService {

    private static final Logger logger = LoggerFactory.getLogger(ManagerServiceImpl.class);

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveRequestHandler handler;

    @Override
    public String updateLeaveStatus(Long leaveRequestId, String status) {
        logger.info("Updating leave status. LeaveRequestId: {}, Status: {}", leaveRequestId, status);

        // Null and empty validation
        if (leaveRequestId == null || status == null || status.trim().isEmpty()) {
            logger.error("Invalid input: leaveRequestId or status is null/empty");
            throw new IllegalArgumentException("LeaveRequestId and status cannot be null or empty");
        }

        try {
            LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                    .orElseThrow(() -> {
                        logger.error("Leave request not found for LeaveRequestId: {}", leaveRequestId);
                        return new RuntimeException("Leave request not found");
                    });

            leaveRequest.setLeaveStatus(status);
            leaveRequest.setUpdatedDate(LocalDateTime.now());
            leaveRequestRepository.save(leaveRequest);
            handler.notifyManager("Leave request " + leaveRequestId + " updated to: " + status);

            logger.info("Leave status updated successfully for LeaveRequestId: {}", leaveRequestId);
            return "Leave request " + status + " successfully";
        } catch (RuntimeException e) {
            logger.error("Error updating leave status for LeaveRequestId: {} - {}", leaveRequestId, e.getMessage());
            return "Error updating leave request: " + e.getMessage();
        } catch (Exception e) {
            logger.error("Unexpected error while updating leave status: {}", e.getMessage(), e);
            return "Unexpected error occurred while updating leave request.";
        }
    }
}
