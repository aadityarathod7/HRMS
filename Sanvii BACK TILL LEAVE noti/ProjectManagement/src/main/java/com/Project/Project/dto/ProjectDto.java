package com.Project.Project.dto;

import com.Project.Project.enums.ProjectStatus;
import lombok.Data;
import java.util.Date;

@Data
public class ProjectDto {
    private String name;
    private Date startDate;
    private Date endDate;
    private String description;
    private String teamMembers;
    private String createdBy;
    private String updatedBy;
    private ProjectStatus status;
}
