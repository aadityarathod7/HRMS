package com.nt.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "departmentId")
    private Long departmentId;

    @Column(name = "departmentName", nullable = false)
    private String departmentName;

    @Column(name = "contactPerson", nullable = false)
    private String contactPerson;

    @Column(name = "createdBy", nullable = false)
    private String createdBy;

    @Column(name = "createdDate")
    private LocalDate createdDate;

    @Column(name = "updatedBy")
    private String updatedBy;

    @Column(name = "updatedDate")
    private LocalDate updatedDate;

    @Column(name = "isActive")
    private boolean isActive;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDate.now();
        isActive = true;

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            createdBy = userDetails.getUsername();  // Set the username as createdBy
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDate.now();
    }
}
