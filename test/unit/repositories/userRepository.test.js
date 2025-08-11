const userRepository = require('../../../src/repositories/userRepository');
const { User } = require('../../../src/database').models;

describe('UserRepository - Database Operations', () => {
  describe('Database Interaction Tests', () => {
    it('should perform insert operation', async () => {
      const userData = {
        username: 'dbtest',
        email: 'dbtest@example.com',
        password: 'password123'
      };

      const user = await userRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe(userData.username);

      // Verify in database
      const dbUser = await User.findByPk(user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.username).toBe(userData.username);
    });

    it('should perform select operation', async () => {
      const user = await User.create({
        username: 'selecttest',
        email: 'select@example.com',
        password: 'password123'
      });

      const foundUser = await userRepository.findById(user.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
      expect(foundUser.username).toBe(user.username);
    });

    it('should perform update operation', async () => {
      const user = await User.create({
        username: 'updatetest',
        email: 'update@example.com',
        password: 'password123'
      });

      const updated = await userRepository.update(user.id, {
        email: 'updated@example.com'
      });

      expect(updated).toBe(true);

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.email).toBe('updated@example.com');
    });

    it('should perform delete operation', async () => {
      const user = await User.create({
        username: 'deletetest',
        email: 'delete@example.com',
        password: 'password123'
      });

      const deleted = await userRepository.delete(user.id);

      expect(deleted).toBe(true);

      const foundUser = await User.findByPk(user.id);
      expect(foundUser).toBeNull();
    });

    it('should handle database transaction rollback', async () => {
      const transaction = await User.sequelize.transaction();

      try {
        const user = await User.create({
          username: 'transactiontest',
          email: 'transaction@example.com',
          password: 'password123'
        }, { transaction });

        // Simulate error that causes rollback
        throw new Error('Simulated error');
      } catch (error) {
        await transaction.rollback();
      }

      // User should not exist after rollback
      const foundUser = await User.findOne({
        where: { username: 'transactiontest' }
      });
      expect(foundUser).toBeNull();
    });

    it('should handle database constraints', async () => {
      await User.create({
        username: 'constrainttest',
        email: 'constraint@example.com',
        password: 'password123'
      });

      // Try to create user with duplicate username
      await expect(User.create({
        username: 'constrainttest',
        email: 'different@example.com',
        password: 'password123'
      })).rejects.toThrow();
    });
  });
});