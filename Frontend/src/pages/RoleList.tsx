import React from 'react';

interface Role {
  id: number;
  role: string;
  createdBy: string;
}

interface RoleListProps {
  roles: Role[];
}

const RoleList: React.FC<RoleListProps> = ({ roles }) => {
  return (
    <div>
      {roles.map((role) => (
        <div key={role.id}>
          <p>Role: {role.role}</p>
          <p>Created By: {role.createdBy}</p>
        </div>
      ))}
    </div>
  );
};

export default RoleList;
