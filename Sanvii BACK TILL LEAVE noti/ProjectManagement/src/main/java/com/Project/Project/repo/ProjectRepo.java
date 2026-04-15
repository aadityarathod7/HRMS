package com.Project.Project.repo;

import com.Project.Project.entity.Project;
import com.Project.Project.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepo extends JpaRepository<Project,String> {

    @Query(value = "SELECT project_id FROM project_table ORDER BY project_id DESC LIMIT 1", nativeQuery = true)
    String findLastProjectId();

    List<Project> findByStatus(ProjectStatus status);

}
