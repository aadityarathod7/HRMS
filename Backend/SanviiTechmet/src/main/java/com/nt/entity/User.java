package com.nt.entity;

import java.sql.Date;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import org.hibernate.annotations.ManyToAny;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name ="\"User\"")
public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;
	private String userName;
	private String password;
	private String firstname;
	private String lastname;
	private Date dob;
	private String contactNumber;
	private String branch;
	private String bloodGroup;
	private Date dateOfJoining;
	private Boolean isActive;
	private String address;
	private String email;
	private String createdBy;
	private Date createdDate;
	private String updatedBy;
	private Date updatedDate;

	@Enumerated(EnumType.STRING)
	private Gender gender;


	@JsonIgnore
	@ManyToMany(fetch = FetchType.EAGER,cascade = CascadeType.ALL)
	@JoinTable(
	        name = "User_Roles", joinColumns = 
	        @JoinColumn(name="user_id",referencedColumnName = "id"),
	        inverseJoinColumns = @JoinColumn(name="role_id",referencedColumnName = "id")
	    )
	private Collection<Roles> roles = new HashSet<Roles>();

	 public String toString(){
		 return "username:"+userName+
				 "password:"+password;
	 }

	public enum Gender {
		MALE, FEMALE, OTHER
	}
}
