package com.nt.controller;


import com.nt.service.ManagerServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/manager")
@CrossOrigin(origins = "http://localhost:8080")
public class ManagerController {

    private static final Logger logger = LoggerFactory.getLogger(ManagerController.class);

    @Autowired
    private ManagerServiceImpl managerService;

    @PutMapping("/leaveRequest/{leaveRequestId}/updateStatus")

    public ResponseEntity<String> updateLeaveStatus(
            @PathVariable Long leaveRequestId,
            @RequestParam String status) {

        logger.info("Received request to update leave status. LeaveRequestId: {}, Status: {}", leaveRequestId, status);

        // Null or empty check
        if (leaveRequestId == null || status == null || status.trim().isEmpty()) {
            logger.error("Invalid input: leaveRequestId or status is null/empty");
            return ResponseEntity.badRequest().body("Invalid input: leaveRequestId and status are required.");
        }

        try {
            String responseMessage = managerService.updateLeaveStatus(leaveRequestId, status);
            logger.info("Leave status updated successfully for LeaveRequestId: {}", leaveRequestId);
            return ResponseEntity.ok(responseMessage);
        } catch (Exception e) {
            logger.error("Error updating leave status for LeaveRequestId: {}", leaveRequestId, e);
            return ResponseEntity.internalServerError().body("Failed to update leave status.");
        }
    }
}
