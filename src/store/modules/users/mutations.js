import { VueOfflineStorage } from "vue-offline";

export default {
  initUser(state) {
    state.loggedInUser = VueOfflineStorage.get("user")
      ? VueOfflineStorage.get("user")
      : {};
  },
  SET_USERS(state, users) {
    state.users = users;
  },
  SET_LOGGED_IN(state, loggedIn) {
    state.loggedIn = loggedIn;
  },
  SET_LOGGED_IN_USER(state, user) {
    console.log("user", user);
    state.loggedInUser = user;
  },
  SET_USERS_META(state, meta) {
    state.usersMeta = meta;
  },
  SET_REAL_ESTATE(state, Settings) {
    state.Settings = Settings;
  }
};
