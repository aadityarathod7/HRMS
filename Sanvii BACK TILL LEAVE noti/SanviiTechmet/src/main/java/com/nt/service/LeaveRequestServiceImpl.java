package com.nt.service;

import com.nt.Impl.LeaveRequestService;
import com.nt.dto.LeaveRequestDto;
import com.nt.entity.LeaveRequest;
import com.nt.handler.LeaveRequestHandler;
import com.nt.repository.LeaveRequestRepository;
import com.nt.request.LeaveRequests;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private static final Logger logger = LoggerFactory.getLogger(LeaveRequestServiceImpl.class);


    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    ModelMapper mapper=new ModelMapper();

    @Autowired
    private LeaveRequestHandler handler;


    @Override
    public LeaveRequests createLeaveRequest(LeaveRequests leaveRequest) {
        leaveRequest.setLeaveStatus("PENDING");
        logger.info("Creating a new leave request with data: {}", leaveRequest);

        // Validate input
        if (leaveRequest.getLeaveType() == null || leaveRequest.getUserId() == null) {
            throw new IllegalArgumentException("LeaveType and userId cannot be null");
        }

        try {
            LeaveRequest leaveRequestEntity = LeaveRequest.builder()
                    .userId(leaveRequest.getUserId())
                    .reportingManagerId(leaveRequest.getReportingManagerId())
                    .leaveStartDate(leaveRequest.getLeaveStartDate())
                    .leaveEndDate(leaveRequest.getLeaveEndDate())
                    .leaveType(leaveRequest.getLeaveType())
                    .description(leaveRequest.getDescription())
                    .leaveStatus(leaveRequest.getLeaveStatus())
                    .createdBy("currentUser")  // Set the current user
                    .createdDate(LocalDateTime.now()) // Set created date
                    .updatedBy(null)  // Should be null on creation
                    .updatedDate(null) // Should be null on creation
                    .build();

            // Save to nt
            LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequestEntity);
            logger.info("Successfully saved leave request with ID: {}", savedRequest.getLeaveRequestId());

            // Notify Manager via WebSocket
            try {
                handler.notifyManager("New leave request received: " + leaveRequest.getLeaveType());
            } catch (Exception ex) {
                logger.error("Failed to send WebSocket notification: {}", ex.getMessage());
            }

            return leaveRequest; // Return saved entity
        } catch (Exception e) {
            logger.error("Database error while saving leave request", e);
            throw new RuntimeException("Failed to create leaveRequest: " + e.getMessage(), e);
        }
    }

    @Override
    public LeaveRequestDto updateLeaveRequest(Long id, LeaveRequestDto leaveRequest) {
        logger.info("Updating leave request with ID: {}", id);
        LeaveRequest map = mapper.map(leaveRequest, LeaveRequest.class);
        LeaveRequest updated = leaveRequestRepository.findById(id).orElseThrow(() -> {
            logger.error("Leave request not found for ID: {}", id);
            return new NullPointerException("Leave request not found");
        });
        try {
            updated.setLeaveStartDate(map.getLeaveStartDate());
            updated.setLeaveEndDate(map.getLeaveEndDate());
            updated.setLeaveType(map.getLeaveType());
            updated.setDescription(map.getDescription());
            updated.setLeaveStatus(map.getLeaveStatus());
            updated.setUpdatedBy(map.getUpdatedBy());
            LeaveRequest save = leaveRequestRepository.save(updated);
            return mapper.map(save, LeaveRequestDto.class);
        }
        catch (RuntimeException e) {
            logger.error("Error occurred while updating leave request with ID: {}", id, e);
            throw new RuntimeException("Failed to update leave request", e);
        }
     }

    @Override
    public void deleteLeaveRequest(Long id) {
        logger.info("Deleting leave request with ID: {}", id);
        try {
            leaveRequestRepository.deleteById(id);
            logger.info("Successfully deleted leave request with ID: {}", id);
        } catch (RuntimeException e) {
            logger.error("Error occurred while deleting leave request with ID: {}", id, e);
            throw new RuntimeException("Failed to delete leave request", e);
        }
    }

    @Override
    public LeaveRequest getLeaveRequestById(Long id) {
        logger.info("Fetching leave request with ID: {}", id);
        return leaveRequestRepository.findById(id)
                .orElseGet(() -> {
                    logger.warn("Leave request with ID {} not found", id);
                    throw new NullPointerException("Leave request not found");
                });
    }

    @Override
    public List<LeaveRequest> getAllLeaveRequests() {
        logger.info("Fetching all leave requests");
        List<LeaveRequest> leaveRequests = leaveRequestRepository.findAll();
        logger.info("Total leave requests found: {}", leaveRequests.size());
        return leaveRequests;
    }
    @Override
    public List<LeaveRequest> getAllApprovedLeaves() {
        return leaveRequestRepository.getAllApprovedLeaves();
    }

    @Override
    public List<LeaveRequest> getAllPendingLeaves() {
        return leaveRequestRepository.getAllPendingLeaves();
    }

    @Override
    public List<LeaveRequest> getAllRejectedLeaves() {
        return leaveRequestRepository.getAllRejectedLeaves();
    }

    @Override
    public List<LeaveRequest> getLeavesByStatus(String status) {
        return leaveRequestRepository.getLeavesByStatus(status);
    }
}

