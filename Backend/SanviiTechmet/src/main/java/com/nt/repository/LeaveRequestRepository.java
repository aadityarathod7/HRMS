package com.nt.repository;
import com.nt.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.leaveStatus = 'APPROVED'")
    List<LeaveRequest> getAllApprovedLeaves();


    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.leaveStatus = 'PENDING'")
    List<LeaveRequest> getAllPendingLeaves();


    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.leaveStatus = 'REJECTED'")
    List<LeaveRequest> getAllRejectedLeaves();


    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.leaveStatus = :status")
    List<LeaveRequest> getLeavesByStatus(@Param("status") String status);


}
