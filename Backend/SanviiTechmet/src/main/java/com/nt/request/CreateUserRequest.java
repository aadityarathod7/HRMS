package com.nt.request;

import com.nt.entity.Roles;
import com.nt.entity.User;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.Collection;
import java.util.Set;

@Data
@Setter
@Getter
public class CreateUserRequest {
    private String firstname;
    private String lastname;
    private Date dob;
    private String contactNumber;
    private String userName;
    private String email;
    private String password;
    private String branch;
    private String bloodGroup;
    private Date dateOfJoining;
    private Boolean isActive;
    private Date createdDate;
    private String updatedBy;
    private Date updatedDate;
    private String createdBy;
    private String address;
    private User.Gender gender;
    private Set<String> roles;
}
