package com.nt.dto;
import lombok.Data;
import java.util.Date;
@Data
public class LeaveRequestDto {
    private Long userId;
    private Long reportingManagerId;
    private Date leaveStartDate;
    private Date leaveEndDate;
    private String leaveType;
    private String description;
    private String leaveStatus;
}
