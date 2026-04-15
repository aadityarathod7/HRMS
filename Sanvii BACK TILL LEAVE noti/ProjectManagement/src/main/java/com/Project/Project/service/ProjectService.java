package com.Project.Project.service;

import com.Project.Project.dto.ProjectDto;
import com.Project.Project.entity.Project;
import com.Project.Project.enums.ProjectStatus;
import org.springframework.stereotype.Service;

import java.util.List;


public interface ProjectService {

    public Project createProject(ProjectDto projectDto);

    public Project updateProject(ProjectDto projectDto, String projectId);

    public List<Project> allProjects();

    public Project updateProjectStatus(String projectId, ProjectStatus newStatus);

    public Project getProjectById(String projectId);

    public List<Project> getProjectsByStatus(ProjectStatus status);
}
