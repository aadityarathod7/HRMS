package com.nt.request;

import lombok.Data;

import java.util.Date;
@Data
public class LeaveRequests {
    private Long userId;
    private Long reportingManagerId;
    private Date leaveStartDate;
    private Date leaveEndDate;
    private String leaveType;
    private String description;
    private String leaveStatus;
}
