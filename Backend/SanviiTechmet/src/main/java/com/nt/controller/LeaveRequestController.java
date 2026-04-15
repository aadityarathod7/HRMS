package com.nt.controller;

import com.nt.Impl.LeaveRequestService;
import com.nt.dto.LeaveRequestDto;
import com.nt.entity.LeaveRequest;
import com.nt.handler.LeaveRequestHandler; // Import the WebSocket handler
import com.nt.request.LeaveRequests;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("leaverequests")
@CrossOrigin(origins = "http://localhost:8080")
public class LeaveRequestController {

    private static final Logger logger = LoggerFactory.getLogger(LeaveRequestController.class);

    @Autowired
    private LeaveRequestService leaveRequestService;

    @Autowired
    private LeaveRequestHandler leaveRequestHandler; // Inject the WebSocket handler

    @PostMapping("/submit")
    public ResponseEntity<LeaveRequests> createLeaveRequest(@RequestBody LeaveRequests leaveRequest) {
        logger.info("Received request to create leave request: {}", leaveRequest);
        try {
            leaveRequestService.createLeaveRequest(leaveRequest);
            // Notify all connected clients
            leaveRequestHandler.notifyManager("New leave request submitted: " + leaveRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(leaveRequest);
        } catch (Exception e) {
            logger.error("Error occurred while creating leave request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<LeaveRequestDto> updateLeaveRequest(@PathVariable Long id, @RequestBody LeaveRequestDto leaveRequest) {
        logger.info("Received request to update leave request with ID: {}", id);
        try {
            LeaveRequestDto updatedRequest = leaveRequestService.updateLeaveRequest(id, leaveRequest);
            if (updatedRequest != null) {
                logger.info("Successfully updated leave request with ID: {}", id);
                // Notify all connected clients
                leaveRequestHandler.notifyManager("Leave request " + id + " has been updated.");
                return ResponseEntity.ok(updatedRequest);
            } else {
                logger.warn("Leave request with ID {} not found", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error occurred while updating leave request with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable Long id) {
        logger.info("Received request to delete leave request with ID: {}", id);
        try {
            leaveRequestService.deleteLeaveRequest(id);
            logger.info("Successfully deleted leave request with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error occurred while deleting leave request with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable Long id) {
        logger.info("Received request to fetch leave request with ID: {}", id);
        LeaveRequest request = leaveRequestService.getLeaveRequestById(id);
        if (request != null) {
            logger.info("Successfully retrieved leave request with ID: {}", id);
            return ResponseEntity.ok(request);
        } else {
            logger.warn("Leave request with ID {} not found", id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        logger.info("Received request to fetch all leave requests");
        List<LeaveRequest> requests = leaveRequestService.getAllLeaveRequests();
        logger.info("Successfully retrieved {} leave requests", requests.size());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/approved")
    public ResponseEntity<?> getAllApprovedLeaves() {
        logger.info("Fetching all approved leave requests.");
        List<LeaveRequest> approvedLeaves = leaveRequestService.getAllApprovedLeaves();

        if (approvedLeaves.isEmpty()) {
            logger.warn("No approved leave requests found in the database.");
            return ResponseEntity.status(404).body("No approved leave requests found.");
        }

        logger.info("Retrieved {} approved leave requests.", approvedLeaves.size());
        return ResponseEntity.ok(approvedLeaves);
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getAllPendingLeaves() {
        logger.info("Fetching all pending leave requests.");
        List<LeaveRequest> pendingLeaves = leaveRequestService.getAllPendingLeaves();

        if (pendingLeaves.isEmpty()) {
            logger.warn("No pending leave requests found in the database.");
            return ResponseEntity.status(404).body("No pending leave requests found.");
        }

        logger.info("Retrieved {} pending leave requests.", pendingLeaves.size());
        return ResponseEntity.ok(pendingLeaves);
    }

    @GetMapping("/rejected")
    public ResponseEntity<?> getAllRejectedLeaves() {
        logger.info("Fetching all rejected leave requests.");
        List<LeaveRequest> rejectedLeaves = leaveRequestService.getAllRejectedLeaves();

        if (rejectedLeaves.isEmpty()) {
            logger.warn("No rejected leave requests found in the database.");
            return ResponseEntity.status(404).body("No rejected leave requests found.");
        }

        logger.info("Retrieved {} rejected leave requests.", rejectedLeaves.size());
        return ResponseEntity.ok(rejectedLeaves);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getLeavesByStatus(@PathVariable String status) {
        logger.info("Fetching leave requests with status: {}", status);
        List<LeaveRequest> leaves = leaveRequestService.getLeavesByStatus(status);

        if (leaves.isEmpty()) {
            logger.warn("No leave requests found with status: {}", status);
            return ResponseEntity.status(404).body("No leave requests found with status: " + status);
        }

        logger.info("Retrieved {} leave requests with status: {}", leaves.size(), status);
        return ResponseEntity.ok(leaves);
    }
}