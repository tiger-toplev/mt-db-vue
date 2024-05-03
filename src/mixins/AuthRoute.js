import { VueOfflineStorage } from "vue-offline";

/**
 * @name AuthRoute
 */
export default {
  beforeRouteEnter(to, from, next) {
    console.log("AuthRoutes: before enter");
    if (
      !VueOfflineStorage.get("apikey") ||
      VueOfflineStorage.get("apikey") === ""
    ) {
      console.log("it doesn't have apikey : redirect to login");
      next({
        name: "login"
      });
    } else {
      next();
    }
  }
};
