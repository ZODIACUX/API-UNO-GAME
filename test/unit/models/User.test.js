const { User } = require('../../../src/database').models;

describe('User Model - CRUD Operations', () => {
  describe('Create User', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.isActive).toBe(true);
    });

    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'plainpassword'
      };

      const user = await User.create(userData);
      const isValidPassword = await user.comparePassword('plainpassword');

      expect(isValidPassword).toBe(true);
      expect(user.password).not.toBe('plainpassword');
    });

    it('should fail to create user with duplicate username', async () => {
      const userData = {
        username: 'duplicate',
        email: 'test1@example.com',
        password: 'password123'
      };

      await User.create(userData);

      await expect(User.create({
        ...userData,
        email: 'test2@example.com'
      })).rejects.toThrow();
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await User.create(userData);

      await expect(User.create({
        ...userData,
        username: 'user2'
      })).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      await expect(User.create({
        username: 'testuser'
        // Missing email and password
      })).rejects.toThrow();
    });
  });

  describe('Read User', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'readtest',
        email: 'read@example.com',
        password: 'password123'
      });
    });

    it('should find user by ID', async () => {
      const foundUser = await User.findByPk(user.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.username).toBe(user.username);
      expect(foundUser.email).toBe(user.email);
    });

    it('should find user by username', async () => {
      const foundUser = await User.findOne({
        where: { username: user.username }
      });

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
    });

    it('should find user by email', async () => {
      const foundUser = await User.findOne({
        where: { email: user.email }
      });

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
    });

    it('should return null for non-existent user', async () => {
      const foundUser = await User.findByPk(99999);
      expect(foundUser).toBeNull();
    });

    it('should exclude password from JSON representation', async () => {
      const userJson = user.toJSON();
      expect(userJson.password).toBeUndefined();
    });
  });

  describe('Update User', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'updatetest',
        email: 'update@example.com',
        password: 'password123'
      });
    });

    it('should update user email', async () => {
      const newEmail = 'newemail@example.com';
      
      await user.update({ email: newEmail });
      await user.reload();

      expect(user.email).toBe(newEmail);
    });

    it('should update user password and hash it', async () => {
      const oldPassword = user.password;
      const newPassword = 'newpassword123';

      await user.update({ password: newPassword });
      await user.reload();

      expect(user.password).not.toBe(oldPassword);
      expect(user.password).not.toBe(newPassword);
      
      const isValidPassword = await user.comparePassword(newPassword);
      expect(isValidPassword).toBe(true);
    });

    it('should update user active status', async () => {
      await user.update({ isActive: false });
      await user.reload();

      expect(user.isActive).toBe(false);
    });

    it('should fail to update with duplicate username', async () => {
      const anotherUser = await User.create({
        username: 'another',
        email: 'another@example.com',
        password: 'password123'
      });

      await expect(user.update({
        username: anotherUser.username
      })).rejects.toThrow();
    });
  });

  describe('Delete User', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'deletetest',
        email: 'delete@example.com',
        password: 'password123'
      });
    });

    it('should delete user successfully', async () => {
      const userId = user.id;
      
      await user.destroy();
      
      const foundUser = await User.findByPk(userId);
      expect(foundUser).toBeNull();
    });

    it('should delete user by ID', async () => {
      const userId = user.id;
      
      const deletedCount = await User.destroy({
        where: { id: userId }
      });
      
      expect(deletedCount).toBe(1);
      
      const foundUser = await User.findByPk(userId);
      expect(foundUser).toBeNull();
    });
  });
});