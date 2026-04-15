package com.nt.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nt.entity.Roles;

public interface IRoleRepository extends JpaRepository<Roles, Integer> {
 
	 public Roles findByRole(String rolename);
}
