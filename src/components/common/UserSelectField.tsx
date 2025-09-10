import React from 'react';
import { Form } from 'react-bootstrap';

export interface UserSelectFieldProps {
  users: Array<{ $id: string; name?: string; email: string }>;
  value: string;
  onChange: (userId: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const UserSelectField: React.FC<UserSelectFieldProps> = ({
  users,
  value,
  onChange,
  placeholder = 'Seleccionar usuario',
  label = 'Usuario',
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <Form.Group className={`mb-3 ${className}`}>
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      <Form.Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        <option value="">{placeholder}</option>
        {users.map(user => (
          <option key={user.$id} value={user.$id}>
            {user.name ? `${user.name} (${user.email})` : user.email}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default UserSelectField;
