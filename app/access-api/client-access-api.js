import { Observer } from "@/app/util";
import { clearRefreshTokenFromCookie, refreshAccessToken } from "@/app/access-api/server-access-api";
import { checkIfUserHasAccess } from "@/app/actions/check-access";

const clientAccessApi = (() => {
    const observers = {
        accessTokenObserver: new Observer() 
    };

    return {
        async clearRefreshToken() {
            await clearRefreshTokenFromCookie();
        },

        async refreshAccessToken(user) {
            const response = await refreshAccessToken(user);
            if(response.success) {
                observers.accessTokenObserver.notify(response.accessToken);
            }
            return response;
        },

        async accessByToken(accessToken) {
            return await checkIfUserHasAccess(accessToken);
        },

        onAccessTokenUpdate(f) {
            observers.accessTokenObserver.subscribe(f);
        }
    };
})();

export default clientAccessApi;