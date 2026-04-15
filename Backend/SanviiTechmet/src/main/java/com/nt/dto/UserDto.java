package com.nt.dto;

import java.sql.Date;
import java.util.Collection;

import com.nt.entity.Roles;

import com.nt.entity.User;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserDto {

    private Integer id;
    private String userName;
    private String email;
    private String firstname;
    private String lastname;
    private Date dob;
    private String contactNumber;
    private String branch;
    private String bloodGroup;
    private Date dateOfJoining;
    private Boolean isActive;
    private Date updatedDate;
    private Date createdDate;
    private String updatedBy;
    private String createdBy;
    private String address;
    private User.Gender gender;
    private Collection<Roles> roles;
}
