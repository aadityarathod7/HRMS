package com.Project.Project.controller;

import com.Project.Project.dto.ProjectDto;
import com.Project.Project.entity.Project;
import com.Project.Project.enums.ProjectStatus;
import com.Project.Project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/project")
@CrossOrigin(origins = "http://localhost:8080")
public class ProjectController {

    @Autowired
    ProjectService projectService;

    @PostMapping("/create")
    public ResponseEntity<Project> addProject(@RequestBody ProjectDto projectDto)
    {
        Project project=projectService.createProject(projectDto);
        return ResponseEntity.ok(project);
    }

    @PutMapping("/update")
    public ResponseEntity<Project> updateProject(@RequestParam String projectId, @RequestBody ProjectDto projectDto)
    {
        Project project=projectService.updateProject(projectDto, projectId);
        return ResponseEntity.ok(project);
    }

    @GetMapping("/all")
    public List<Project> allProjects()
    {
        return projectService.allProjects();
    }

    @GetMapping("/{id}")
    public Project getById(@PathVariable("id") String projectId){
        return projectService.getProjectById(projectId);
    }

    @PutMapping("/UpdateStatus")
    public ResponseEntity<Project> updateStatus(@RequestParam String projectId, @RequestParam ProjectStatus status) {
        Project updatedProject = projectService.updateProjectStatus(projectId, status);
        return ResponseEntity.ok(updatedProject);
    }

    @GetMapping("/getByStatus/{status}")
    public ResponseEntity<List<Project>> getAllByStatus(@PathVariable("status") ProjectStatus projectStatus){
        return new ResponseEntity<>(projectService.getProjectsByStatus(projectStatus), HttpStatus.OK);
    }
}


