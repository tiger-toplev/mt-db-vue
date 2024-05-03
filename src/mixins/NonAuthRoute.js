import { VueOfflineStorage } from "vue-offline";

/**
 * @name AuthRoute
 */
export default {
  beforeRouteEnter(to, from, next) {
    console.log("NonAuthRoutes: before enter");
    if (VueOfflineStorage.get("apikey")) {
      console.log("it has apikey : redirect to product list");
      next({
        name: "ProductList"
      });
    } else next();
  }
};
