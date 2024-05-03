import axios from "axios";
import { VueOfflineStorage } from "vue-offline";
import Vue from "vue";

export default {
  createUser({ dispatch }, payload) {
    console.log("createUser", dispatch);
    return new Promise((resolve, reject) =>
      axios
        .post("users", payload)
        .then(({ data: r }) => resolve(r))
        .catch(({ response: { data: err } }) => reject(err))
    );
  },
  me({ dispatch, commit }) {
    return new Promise((resolve, reject) =>
      axios
        .get("/users/me")
        .then(({ data: r }) => {
          if (r.data) {
            commit("SET_LOGGED_IN", true);
            commit("SET_LOGGED_IN_USER", r.data);
          }

          resolve(r);
        })
        .catch(({ response: { data: err, status } }) => {
          if (status === 401) {
            dispatch("forceLogout");
          }

          reject(err);
        })
    );
  },
  login({ commit }, { username, password }) {
    // VueOfflineStorage.set("apikey", "124234234");
    // return new Promise((resolve, reject) => {
    //   if (email) {
    //     //commit("SET_LOGGED_IN", true);
    //     commit("SET_LOGGED_IN_USER", {
    //       email,
    //       password
    //     });
    //     resolve(true);
    //    } else {
    //      reject();
    //    }
    // });

    return new Promise((resolve, reject) =>
      axios
        .post(process.env.VUE_APP_API_AUTH_BASE_URL + "auth/login", {
          username,
          password
        })
        .then(({ data: r }) => {
          if (r.apikey) {
            VueOfflineStorage.set("apikey", r.apikey);
            VueOfflineStorage.set("account_id", r.account_id);
            VueOfflineStorage.set("user", r.principal);
            Vue.mtapi.setCredentials({
              account_id: 1,
              api_key: "32e7f8ad-6902-440d-acb8-2db66a67494f"
            });
            commit("SET_LOGGED_IN_USER", r.principal);
          }

          resolve(r);
        })
        .catch(({ response: { data: err } }) => reject(err))
    );
  },
  sendForgotPassword(_, payload) {
    return new Promise((resolve, reject) =>
      axios
        .post(
          process.env.VUE_APP_API_AUTH_BASE_URL + "auth/password/forgot",
          payload
        )
        .then(({ data: r }) => resolve(r))
        .catch(({ response: { data: err } }) => reject(err))
    );
  },
  resetPasswordRequest(_, payload) {
    return new Promise((resolve, reject) =>
      axios
        .post(
          process.env.VUE_APP_API_AUTH_BASE_URL + "auth/password/reset",
          payload
        )
        .then(({ data: r }) => resolve(r))
        .catch(({ response: { data: err } }) => reject(err))
    );
  },
  logout({ dispatch, commit }) {
    console.log("logout", dispatch, commit);
    return new Promise((resolve, reject) =>
      axios
        .get("auth/logout")
        .then(({ status }) => {
          if (status === 200) {
            localStorage.removeItem("apikey");
            localStorage.removeItem("account_id");
            localStorage.removeItem("user");
            // dispatch('application/setLocale', '');
            // commit('SET_LOGGED_IN', false);
            // commit('SET_LOGGED_IN_USER', {});
          }
          resolve();
        })
        .catch(error => {
          console.log(error);
          reject();
        })
    );
  },
  forceLogout({ commit }) {
    localStorage.removeItem("apikey");
    localStorage.removeItem("account_id");

    //TODO figure out how to logout without reloading the page
    window.location.reload();
    // dispatch('application/setLocale', '');
    commit("SET_LOGGED_IN", false);
    commit("SET_LOGGED_IN_USER", {});
  }
};
