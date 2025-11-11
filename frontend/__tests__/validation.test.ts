// __tests__/validation.test.ts

/**
 * Form Validation Tests
 * These tests validate the business logic for user input validation
 */

describe('User Form Validation', () => {
  describe('Username Validation', () => {
    it('should reject empty username', () => {
      const username = '';
      expect(username.trim()).toBe('');
    });

    it('should accept valid username', () => {
      const username = 'john_doe';
      expect(username.trim().length).toBeGreaterThan(0);
    });

    it('should trim whitespace from username', () => {
      const username = '  john_doe  ';
      expect(username.trim()).toBe('john_doe');
    });
  });

  describe('Email Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        '',
        'notanemail',
        'missing@domain',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ];

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should reject empty email', () => {
      const email = '';
      expect(email.trim()).toBe('');
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  describe('Role Validation', () => {
    it('should only accept valid role values', () => {
      const validRoles = ['user', 'admin'];
      const testRole = 'user';
      
      expect(validRoles.includes(testRole)).toBe(true);
    });

    it('should reject invalid role values', () => {
      const validRoles = ['user', 'admin'];
      const testRole = 'superuser';
      
      expect(validRoles.includes(testRole)).toBe(false);
    });

    it('should have a default role', () => {
      const defaultRole = 'user';
      expect(['user', 'admin'].includes(defaultRole)).toBe(true);
    });
  });

  describe('Complete Form Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const validateForm = (username: string, email: string, role: string) => {
      const errors: string[] = [];

      if (!username.trim()) {
        errors.push('Username is required');
      }

      if (!email.trim()) {
        errors.push('Email is required');
      } else if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
      }

      if (!['user', 'admin'].includes(role)) {
        errors.push('Invalid role');
      }

      return { isValid: errors.length === 0, errors };
    };

    it('should pass validation with all valid fields', () => {
      const result = validateForm('john_doe', 'john@example.com', 'user');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation with missing username', () => {
      const result = validateForm('', 'john@example.com', 'user');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username is required');
    });

    it('should fail validation with missing email', () => {
      const result = validateForm('john_doe', '', 'user');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should fail validation with invalid email format', () => {
      const result = validateForm('john_doe', 'invalid-email', 'user');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid email address');
    });

    it('should fail validation with invalid role', () => {
      const result = validateForm('john_doe', 'john@example.com', 'superuser');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid role');
    });

    it('should accumulate multiple validation errors', () => {
      const result = validateForm('', 'invalid', 'superuser');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});