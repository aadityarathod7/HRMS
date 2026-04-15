package com.nt.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.Date;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.PreUpdate;
import org.springframework.data.annotation.Version;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long leaveRequestId;

    @Column(nullable = false)
    private Long userId; // Foreign key (Assuming Employee exists in another table)

    @Column(nullable = false)
    private Long reportingManagerId; //its exist in employee table

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    private Date leaveStartDate;

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    private Date leaveEndDate;

    @Column(nullable = false)
    private String leaveType;

    private String description;

    @Column(nullable = false)
    private String leaveStatus;

    private String createdBy;

    private LocalDateTime createdDate;

    private String updatedBy;

    private LocalDateTime updatedDate;


    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
}

