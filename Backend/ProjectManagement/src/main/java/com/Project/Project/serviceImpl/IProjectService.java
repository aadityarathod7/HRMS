package com.Project.Project.serviceImpl;

import com.Project.Project.dto.ProjectDto;
import com.Project.Project.entity.Project;
import com.Project.Project.enums.ProjectStatus;
import com.Project.Project.repo.ProjectRepo;
import com.Project.Project.service.ProjectService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class IProjectService implements ProjectService {

    @Autowired
    private ProjectRepo projectRepo;

    @Override
    public Project createProject(ProjectDto projectDto) {
        String lastId = projectRepo.findLastProjectId();
        int nextNumber = 1;
        if (lastId != null && lastId.matches("Sanvii-\\d+")) {
            String[] parts = lastId.split("-");
            nextNumber = Integer.parseInt(parts[1]) + 1;
        }
        String formattedId = String.format("Sanvii-%03d", nextNumber);

        Project project = new Project();
        project.setProjectId(formattedId);
        project.setName(projectDto.getName());
//        project.setCreatedBy(projectDto.getCreatedBy());
        project.setStartDate(projectDto.getStartDate());
        project.setEndDate(projectDto.getEndDate());
        project.setDescription(projectDto.getDescription());
        project.setTeamMembers(project.getTeamMembers());
        project.setCreatedDate(new Date());
        project.setStatus(projectDto.getStatus() != null ? projectDto.getStatus() : ProjectStatus.ACTIVE);

        return projectRepo.save(project);

    }

    @Override
    @Transactional
    public Project updateProject(ProjectDto projectDto, String projectId) {

        Project existingProject = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
        if (projectDto.getName() != null) existingProject.setName(projectDto.getName());
        if (projectDto.getCreatedBy() != null) existingProject.setCreatedBy(projectDto.getCreatedBy());
        if (projectDto.getStartDate() != null) existingProject.setStartDate(projectDto.getStartDate());
        if (projectDto.getEndDate() != null) existingProject.setEndDate(projectDto.getEndDate());
        if (projectDto.getDescription() != null) existingProject.setDescription(projectDto.getDescription());
        if (projectDto.getTeamMembers() != null) existingProject.setTeamMembers(projectDto.getTeamMembers());
        existingProject.setUpdatedBy(projectDto.getUpdatedBy());
        existingProject.setUpdatedDate(new Date());

        return projectRepo.save(existingProject);
    }

    @Override
    public List<Project> allProjects()
    {
        return projectRepo.findAll();
    }

    @Override
    public Project updateProjectStatus(String projectId, ProjectStatus newStatus) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        project.setStatus(newStatus);
        project.setUpdatedDate(new Date());

        return projectRepo.save(project);
    }

    @Override
    public Project getProjectById(String projectId) {
        return  projectRepo.findById(projectId).get();
    }

    @Override
    public List<Project> getProjectsByStatus(ProjectStatus status) {
        return   projectRepo.findByStatus(status);
    }

}

