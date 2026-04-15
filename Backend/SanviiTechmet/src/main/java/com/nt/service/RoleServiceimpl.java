package com.nt.service;
import com.nt.Impl.RoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.nt.entity.Roles;

import javax.management.relation.RoleNotFoundException;
import java.security.Principal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RoleServiceimpl implements RoleService {

	private static final Logger logger = LoggerFactory.getLogger(RoleServiceimpl.class);
	@Autowired
	private com.nt.repository.RoleRepository roleRepository;

//	@Override
//	public void addRole(Roles role) {
//		RoleRepository.save(role);
//	}

	@Override
	public List<Roles> getIsActive() throws Exception {
		List<Roles> roleList = roleRepository.getIsActive();
		try {
			if (!roleList.isEmpty()) {
				return roleList;
			}
		} catch (Exception e) {
			logger.error("------Error occur while display isactive role list------");
			throw new Exception("No role record exist ......");
		}
		return roleList;
	}

	@Override
	public List<Roles> getInActive() throws Exception {
		List<Roles> inActiveRoleList = roleRepository.getInActive();
		try {
			if (!inActiveRoleList.isEmpty()) {
				return inActiveRoleList;
			}
		} catch (Exception e) {
			logger.error("------Error occur while display isactive role list------" );
			throw new Exception("No role record exist ......");
		}
		return inActiveRoleList;
	}

	@Override
	public Roles createRole(Roles role) throws Exception {
		logger.info("Creating role: {}", role.getRole());

		if (roleRepository.existsByRole(role.getRole())) {
			logger.error("Role {} already exists", role.getRole());
			throw new RoleNotFoundException("Role with name " + role.getRole() + " already exists");
		}

		String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();
		role.setCreatedBy(currentUserName);
		role.setCreatedDate(new Date(System.currentTimeMillis()));
		role.setUpdatedBy(role.getUpdatedBy());
		role.setUpdatedDate(role.getUpdatedDate());
		role.setActive(true);

		Roles savedRole = roleRepository.save(role);
		logger.info("Role {} created successfully", savedRole.getRole());
		return savedRole;
	}

	@Override
	public Roles getRoleById(Integer roleId) throws Exception {
		try {
			Optional<Roles> role = roleRepository.findById(roleId);
			if (!role.isPresent()) {
				throw new RuntimeException("Role not found for the given ID: " + roleId);
			}
			return role.get();
		} catch (Exception e) {
			logger.error("Error occurred while fetching role by ID: ");
			throw new RuntimeException("Role not found for the given ID.");
		}
	}

	@Override
	public Roles deactivateRole(Integer roleId) throws Exception {
		Roles role = roleRepository.findById(roleId)
				.orElseThrow(() -> new Exception("Role not found with ID: " + roleId));

		role.setActive(false);
		String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();
		role.setUpdatedBy(currentUserName);
		role.setUpdatedDate(new Date(System.currentTimeMillis()));
		Roles updatedRole = roleRepository.save(role);

		logger.info("Role {} deactivated successfully", updatedRole.getRole());
		return updatedRole;
	}

	@Override
	public Roles activateRole(Integer roleId) throws Exception {
		Roles role = roleRepository.findById(roleId)
				.orElseThrow(() -> new Exception("Role not found with ID: " + roleId));

		role.setActive(true);
		String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();
		role.setUpdatedBy(currentUserName);
		role.setUpdatedDate(new Date(System.currentTimeMillis()));
		Roles updatedRole = roleRepository.save(role);

		logger.info("Role {} activated successfully", updatedRole.getRole());
		return updatedRole;
	}

	@Override
	public Roles updateRole(Integer id, Roles roleDetails) throws Exception {
		Roles existingRole = roleRepository.findById(id)
				.orElseThrow(() -> new Exception("Role not found with ID: " + id));

		if (roleDetails.getRole() != null) {
			existingRole.setRole(roleDetails.getRole());
		}

		// Keep the original created information
		existingRole.setCreatedBy(existingRole.getCreatedBy());
		existingRole.setCreatedDate(existingRole.getCreatedDate());

		// Update the updated information
		String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();
		existingRole.setUpdatedBy(currentUserName);
		existingRole.setUpdatedDate(new Date(System.currentTimeMillis()));

		Roles savedRole = roleRepository.save(existingRole);
		logger.info("Role {} updated successfully", savedRole.getRole());
		return savedRole;
	}
}