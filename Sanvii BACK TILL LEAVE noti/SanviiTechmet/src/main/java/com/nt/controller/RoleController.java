package com.nt.controller;

import com.nt.Impl.RoleService;
import com.nt.entity.Roles;

import com.nt.service.FileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role")
public class RoleController {
    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    @Autowired
    private RoleService roleService;

    @GetMapping("/active")
    public ResponseEntity<List<Roles>> getIsActive() {
        try {
            List<Roles> roleList = roleService.getIsActive();
            return new ResponseEntity<>(roleList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error while displaying active role list: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<Roles>> getInActive() {
        try {
            List<Roles> roleList = roleService.getInActive();
            return new ResponseEntity<>(roleList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error while displaying inactive role list: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/create")
    public ResponseEntity<Roles> createRole(@RequestBody Roles role) {
        try {
            Roles newRole = roleService.createRole(role);
            return new ResponseEntity<>(newRole, HttpStatus.CREATED);
        } catch (Exception ex) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<Roles> getRoleById(@PathVariable("roleId") Integer roleId) {
        try {
            Roles role = roleService.getRoleById(roleId);
            return new ResponseEntity<>(role, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error while retrieving role by id: ", e);
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/deactivate/{id}")
    public ResponseEntity<Roles> deactivateRole(@PathVariable Integer id) {
        try {
            Roles deactivatedRole = roleService.deactivateRole(id);
            return new ResponseEntity<>(deactivatedRole, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error while deactivating role: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/activate/{id}")
    public ResponseEntity<Roles> activateRole(@PathVariable Integer id) {
        try {
            Roles activatedRole = roleService.activateRole(id);
            return new ResponseEntity<>(activatedRole, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error while activating role: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Roles> updateRole(@PathVariable Integer id, @RequestBody Roles roleDetails) {
        try {
            Roles updatedRole = roleService.updateRole(id, roleDetails);
            return new ResponseEntity<>(updatedRole, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error while updating role: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
