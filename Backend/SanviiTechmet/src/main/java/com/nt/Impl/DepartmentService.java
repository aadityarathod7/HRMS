package com.nt.Impl;

import com.nt.dto.DepartmentDto;
import com.nt.entity.Department;

import java.util.List;

public interface DepartmentService {

    Department createDepartment(DepartmentDto departmentDto);

    Department updateById(Long departmentId, DepartmentDto department);

    void activateDepartment(Long departmentId) ;

    void deactivateDepartment(Long departmentId);

    Department findByDepartmentId(Long departmentId);

    List<Department> getAllActiveDepartments()throws Exception;

    List<Department> getAllInactiveDepartments()throws Exception;
}


