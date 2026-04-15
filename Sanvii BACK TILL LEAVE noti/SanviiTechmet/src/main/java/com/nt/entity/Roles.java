package com.nt.entity;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Roles {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String role;
    private String description;
    private String createdBy;
    @Temporal(TemporalType.DATE)
    private Date createdDate;
    private String UpdatedBy;
    private Date UpdatedDate;
    private boolean isActive;

    public void setActive(boolean active) {
        isActive = active;
    }

    @JsonIgnore
    @ManyToMany(mappedBy = "roles")
    private Collection<User> users = new HashSet<User>();

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RoleMenuAction> roleMenuActions = new HashSet<>();

    public Roles(String name) {
        this.role = name;
    }

    public Roles(Integer roleId, String createdBy, Date createdDate, boolean isActive,String roleName, String description) {
        this.id = roleId;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.isActive = isActive;
        this.role = roleName;
        this.description = description;
    }


}
