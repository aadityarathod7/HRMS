package com.nt.controller;

import com.nt.Impl.DepartmentService;
import com.nt.dto.DepartmentDto;
import com.nt.entity.Department;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/departments")
public class DepartmentController {
    private static final Logger logger = LoggerFactory.getLogger(DepartmentController.class);

    @Autowired
    private DepartmentService departmentService;

    @PostMapping("/create")
    public ResponseEntity<com.nt.entity.Department> createDepartment(@RequestBody DepartmentDto departmentDto) {
        logger.info("Received request to create department: {}", departmentDto);
        Department department = departmentService.createDepartment(departmentDto);
        logger.info("Department created successfully: {}", department);
        return ResponseEntity.status(HttpStatus.CREATED).body(department);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody DepartmentDto department) {
        logger.info("Received request to update department with ID: {}", id);
        Department department1 = departmentService.updateById(id, department);
        logger.info("Department updated successfully: {}", department1);
        return ResponseEntity.status(HttpStatus.OK).body(department1);
    }

    @PatchMapping("/activate/{id}")
    public ResponseEntity<String> activateDepartment(@PathVariable Long id) {
        logger.info("Received request to activate department with ID: {}", id);
        departmentService.activateDepartment(id);
        logger.info("Department with ID {} activated successfully.", id);
        return ResponseEntity.status(HttpStatus.OK).body("Department activated successfully!");
    }

    @PatchMapping("/deactivate/{id}")
    public ResponseEntity<String> deactivateDepartment(@PathVariable Long id) {
        logger.info("Received request to deactivate department with ID: {}", id);
        departmentService.deactivateDepartment(id);
        logger.info("Department with ID {} deactivated successfully.", id);
        return ResponseEntity.status(HttpStatus.OK).body("Department deactivated successfully!");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        logger.info("Fetching department with ID: {}", id);
        Department department = departmentService.findByDepartmentId(id);
        logger.info("Department found: {}", department);
        return ResponseEntity.status(HttpStatus.OK).body(department);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Department>> getAllActiveDepartments() throws Exception {
        logger.info("Fetching all active departments");
        List<Department> list = departmentService.getAllActiveDepartments();
        logger.info("Total active departments fetched: {}", list.size());
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<Department>> getAllInactiveDepartments() throws Exception {
        logger.info("Fetching all deactivated departments");
        List<Department> list = departmentService.getAllInactiveDepartments();
        logger.info("Total deactivated departments fetched: {}", list.size());
        return ResponseEntity.status(HttpStatus.OK).body(list);

    }
}

