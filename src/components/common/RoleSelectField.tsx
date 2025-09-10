import React from 'react';
import { Form } from 'react-bootstrap';

export interface RoleSelectFieldProps {
  roles: string[];
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
  label?: string;
  className?: string;
}

const RoleSelectField: React.FC<RoleSelectFieldProps> = ({
  roles,
  selectedRoles,
  onRoleToggle,
  label = 'Roles',
  className = ''
}) => {
  return (
    <Form.Group className={`mb-3 ${className}`}>
      <Form.Label>{label}</Form.Label>
      <div>
        {roles.map(role => (
          <Form.Check
            key={role}
            type="checkbox"
            id={`role-${role}`}
            label={role.charAt(0).toUpperCase() + role.slice(1)}
            checked={selectedRoles.includes(role)}
            onChange={() => onRoleToggle(role)}
          />
        ))}
      </div>
    </Form.Group>
  );
};

export default RoleSelectField;
