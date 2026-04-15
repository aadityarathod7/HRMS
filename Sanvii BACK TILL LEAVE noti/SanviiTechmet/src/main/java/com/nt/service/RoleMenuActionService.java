package com.nt.service;

import com.nt.entity.RoleMenuAction;
import com.nt.repository.RoleMenuActionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleMenuActionService {

    @Autowired
    private RoleMenuActionRepository roleMenuActionRepository;

    public boolean hasPermission(Integer roleId, Integer menuItemId, Integer menuActionId) {
        List<RoleMenuAction> roleMenuActions = roleMenuActionRepository
                .findByRoleIdAndMenuItemIdAndMenuActionId(roleId, menuItemId, menuActionId);

        return roleMenuActions.stream()
                .anyMatch(roleMenuAction -> roleMenuAction.isAllowed());
    }
}
