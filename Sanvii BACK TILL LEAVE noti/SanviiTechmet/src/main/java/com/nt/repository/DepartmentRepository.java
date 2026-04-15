package com.nt.repository;

import com.nt.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByDepartmentId(Long departmentId) ;
    List<Department> findByIsActiveTrue();
    List<Department> findByIsActiveFalse() ;
}
