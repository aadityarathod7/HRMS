package com.nt.repository;

import com.nt.entity.RoleMenuAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleMenuActionRepository extends JpaRepository<RoleMenuAction, Integer> {
    List<RoleMenuAction> findByRoleIdAndMenuItemIdAndMenuActionId(Integer roleId, Integer menuItemId, Integer menuActionId);
}
