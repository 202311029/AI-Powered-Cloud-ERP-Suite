import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'amdox',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'erp-frontend',
};

let keycloak: Keycloak | null = null;

if (typeof window !== 'undefined') {
  keycloak = new Keycloak(keycloakConfig);
}

export { keycloak };

export const initKeycloak = (onAuthenticated: () => void) => {
  if (!keycloak) return;

  keycloak
    .init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    })
    .then((authenticated) => {
      if (authenticated) {
        localStorage.setItem('amdox_token', keycloak?.token || '');
        onAuthenticated();
      }
    })
    .catch((err) => {
      console.error('Keycloak Init Error:', err);
    });
};
