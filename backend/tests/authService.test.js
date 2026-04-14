const authService = require('../src/services/authService');

describe('AuthService', () => {
  describe('register', () => {
    it('should throw error for invalid email', async () => {
      await expect(
        authService.register('invalidemail', 'Password123!', 'John', 'Doe')
      ).rejects.toThrow('Email inválido');
    });

    it('should throw error for short password', async () => {
      await expect(
        authService.register('test@example.com', 'short', 'John', 'Doe')
      ).rejects.toThrow('La contraseña debe tener al menos 8 caracteres');
    });
  });

  describe('login', () => {
    it('should throw error for missing credentials', async () => {
      await expect(
        authService.login('', '')
      ).rejects.toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid_token');
      }).toThrow('Token inválido o expirado');
    });
  });
});
