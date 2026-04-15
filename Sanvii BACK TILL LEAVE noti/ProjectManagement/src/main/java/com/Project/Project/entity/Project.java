package com.Project.Project.entity;

import com.Project.Project.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Project_table")
@EntityListeners(AuditingEntityListener.class)
public class Project {
    @Id
    private String projectId;

    private String name;


    private Date startDate;


    private Date endDate;

    private String description;

    private String teamMembers;

    private String createdBy;

    @CreatedDate

    private Date createdDate;

    private String updatedBy;

    @LastModifiedDate

    private Date updatedDate;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;
}
