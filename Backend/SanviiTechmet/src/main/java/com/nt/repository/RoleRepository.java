package com.nt.repository;

import com.nt.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@EnableJpaRepositories
public interface RoleRepository extends JpaRepository<Roles, Integer> {

    public Roles findByRole(String roleName);

    @Query("SELECT u FROM Roles u WHERE u.isActive=true")
    public List<Roles> getIsActive();

    @Query("SELECT u FROM Roles u WHERE u.isActive=false")
    public List<Roles> getInActive();

//    @Query("UPDATE Roles s SET s.isActive='0' WHERE s.id = :roleId")
    public Optional<Roles> findById(Integer id);

    boolean existsByRole(String role);
}