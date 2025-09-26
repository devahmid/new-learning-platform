export const environment = {
  production: false,
  apiUrl: 'https://centre-culturel-olivier.com/api', // API PHP pour tests
  apiType: 'php',
  corsEnabled: true,
  // Configuration pour développement avec CORS
  httpOptions: {
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
};
