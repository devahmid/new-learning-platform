export function getDecodedToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
  