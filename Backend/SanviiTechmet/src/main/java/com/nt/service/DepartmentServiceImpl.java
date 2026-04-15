package com.nt.service;

import com.nt.Impl.DepartmentService;
import com.nt.dto.DepartmentDto;
import com.nt.entity.Department;
import com.nt.entity.Roles;
import com.nt.exception.DepartmentNotFoundException;
import com.nt.repository.DepartmentRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private static final Logger logger = LoggerFactory.getLogger(DepartmentServiceImpl.class);

    ModelMapper modelMapper = new ModelMapper();

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public Department createDepartment(DepartmentDto departmentDto) {
        logger.info("Creating a new department with data: {}", departmentDto);
        Department department = modelMapper.map(departmentDto, Department.class);
        try {
            Department saveDepartment = departmentRepository.save(department);
            logger.info("Department created successfully: {}", saveDepartment);
            String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();
            department.setCreatedBy(currentUserName);
            department.setCreatedDate(new Date(System.currentTimeMillis()).toLocalDate());
            department.setUpdatedBy(department.getUpdatedBy());
            department.setUpdatedDate(department.getUpdatedDate());
            return saveDepartment;
        }
        catch (RuntimeException e) {
            logger.error("Error occurred while saving the department", e);
            throw new RuntimeException("Failed to create department", e);
        }
    }

    @Override
    public Department updateById(Long id, DepartmentDto departmentDetails) {
        logger.info("Updating department with ID: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                {
                    logger.warn("Department with ID {} not found", id);
                    return new DepartmentNotFoundException("Department not found for ID: " + id);
                });
        String currentUserName =  SecurityContextHolder.getContext().getAuthentication().getName();
        department.setDepartmentName(departmentDetails.getDepartmentName());
        department.setContactPerson(departmentDetails.getContactPerson());
        department.setCreatedBy(department.getCreatedBy());
        department.setCreatedDate(department.getCreatedDate());
        department.setUpdatedBy(currentUserName);
        department.setUpdatedDate(new Date(System.currentTimeMillis()).toLocalDate());
        Department updatedDepartment = departmentRepository.save(department);
        logger.info("Department updated successfully: {}", updatedDepartment);
        return updatedDepartment;
    }

    @Override
    public void activateDepartment(Long id) {
        logger.info("Activating department with ID: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                {
                    logger.warn(" no Department ID {} not found", id);
                    return new DepartmentNotFoundException("Department not found for ID: " + id);
                });
        department.setActive(true);
        departmentRepository.save(department);
        logger.info("Department with ID {} activated successfully", id);
    }

    @Override
    public void deactivateDepartment(Long id) {
        logger.info("Deactivating department with ID: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                {
                    logger.warn(" No Department {} not found", id);
                    return new DepartmentNotFoundException("Department not found for ID: " + id);
                });
        department.setActive(false);
        departmentRepository.save(department);
        logger.info("Department with ID {} deactivated successfully", id);
    }

    @Override
    public Department findByDepartmentId(Long id){
        logger.info("Fetching department with ID: {}", id);
        return departmentRepository.findByDepartmentId(id).
                orElseThrow(() ->
                {
                    logger.warn("Department  {} not found", id);
                    return new DepartmentNotFoundException("Department Not Found"+id);
                });
    }

    @Override
    public List<Department> getAllActiveDepartments() throws Exception {
        List<Department> inActiveDepartnentsList = departmentRepository.findByIsActiveTrue();
        try {
            if (!inActiveDepartnentsList.isEmpty()) {
                return inActiveDepartnentsList;
            }
        } catch (Exception e) {
            logger.error("------Error occur while display active role list------" );
            throw new Exception("No department record exist ......");
        }
        return inActiveDepartnentsList;

    }

    @Override
    public List<Department> getAllInactiveDepartments() throws Exception {
        List<Department> activeDepartnentsList = departmentRepository.findByIsActiveFalse();
        try {
            if (!activeDepartnentsList.isEmpty()) {
                return activeDepartnentsList;
            }
        } catch (Exception e) {
            logger.error("------Error occur while display isactive department list------");
            throw new Exception("No department record exist ......");
        }
        return activeDepartnentsList;
    }
}

