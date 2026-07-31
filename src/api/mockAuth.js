const MOCK_USER = {
  userId: 1,
  email: 'admin',
  username: 'admin',
  name: 'Admin',
  role: 'ADMIN',
  theme: 'LIGHT',
  mobile: 0,
  profile: '',
};

export function mockLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin' && password === 'pass') {
        resolve({
          success: true,
          message: 'Login successful',
          data: MOCK_USER,
          error: null,
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
}
