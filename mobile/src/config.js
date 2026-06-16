// Use local machine IP or production domain.
// 10.0.2.2 is the standard Android emulator alias for localhost.
const API_URL = process.env.API_URL || 'http://10.0.2.2:3000';

export default {
  API_URL,
};
