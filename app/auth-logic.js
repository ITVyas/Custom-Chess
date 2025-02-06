const SessionStorageRefreshTokenKey = '0de92d3720d1d4b6d6c89c7396af8db93bfdd6f76d72ce8f09ecfead825e71f9';

export function authorizeUser() {
    const refreshToken = localStorage.getItem(SessionStorageRefreshTokenKey);
    if(!refreshToken) return false;

    
}