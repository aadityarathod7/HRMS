package com.nt.Impl;

import com.nt.dto.LeaveRequestDto;
import com.nt.entity.LeaveRequest;
import com.nt.request.LeaveRequests;

import java.util.List;

public interface LeaveRequestService {
    LeaveRequests createLeaveRequest(LeaveRequests leaveRequest);
    LeaveRequestDto updateLeaveRequest(Long id, LeaveRequestDto leaveRequest);
    void deleteLeaveRequest(Long id);
    LeaveRequest getLeaveRequestById(Long id);
    List<LeaveRequest> getAllLeaveRequests();
    List<LeaveRequest> getAllApprovedLeaves();
    List<LeaveRequest> getAllPendingLeaves();
    List<LeaveRequest> getAllRejectedLeaves();
    List<LeaveRequest> getLeavesByStatus(String status);
}
