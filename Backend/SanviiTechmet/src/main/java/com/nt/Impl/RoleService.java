package com.nt.Impl;
import com.nt.entity.Roles;

import java.util.List;
import java.util.Optional;

public interface RoleService {
    public List<Roles> getIsActive() throws Exception;

    public List<Roles> getInActive() throws Exception;

    public Roles createRole(Roles role) throws Exception;

    public Roles getRoleById(Integer roleId) throws Exception;

    public Roles deactivateRole(Integer roleId) throws Exception;

    public Roles activateRole(Integer roleId) throws Exception;

    public Roles updateRole(Integer id, Roles roleDetails) throws Exception;

}
