import Vue from "vue";

import App from "./App.vue";
import router from "./router";
import axios from "axios";
import VueAxios from "vue-axios";
import store from "./store";
import messages from "./lang/index";
import VueI18n from "vue-i18n";
import VueLodash from "vue-lodash";
import lodash from "lodash";
import { VueOfflineStorage } from "vue-offline";
import { Api } from "./Api.js";
//import { Storage } from "./Storage.js";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
// import components
import TreeSelector from "./components/TreeSelector.vue";
import TreeSelectorInput from "./components/TreeSelectorInput.vue";
import TreeSelectorInputRow from "./components/TreeSelectorInputRow.vue";
//import VueBootstrapTypeahead from "vue-bootstrap-typeahead";
import VueSingleSelect from "vue-single-select";
//import VueAutosuggest from 'vue-autosuggest';
import VueSimpleSuggest from "vue-simple-suggest";
import "vue-simple-suggest/dist/styles.css";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import Multiselect from "vue-multiselect";

// Subscribe to store updates
store.subscribe((mutation, state) => {
  console.log("store subscribe change", state);
  // Store the state object as a JSON string
  localStorage.setItem("store", JSON.stringify(state));
});

// Install Axios
Vue.use(VueAxios, axios);
// Install I18n
Vue.use(VueI18n);
// Install VueLoadsh
Vue.use(VueLodash, { name: "custom", lodash: lodash });
// Install VueOfflineStorage : localstrage
Vue.use(VueOfflineStorage);
// Install BootstrapVue
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
// Install API : To be updated later...
Vue.use(new Api(process.env.VUE_APP_API_BASE_URL));
// Install Storage : To be removed
//Vue.use(new Storage());

// Install components
Vue.component("tree-selector", TreeSelector);
Vue.component("tree-selector-input", TreeSelectorInput);
Vue.component("tree-selector-input-row", TreeSelectorInputRow);
//Vue.component("vue-bootstrap-typeahead", VueBootstrapTypeahead);
Vue.component("vue-single-select", VueSingleSelect);
Vue.component("vue-simple-suggest", VueSimpleSuggest);
Vue.component("v-select", vSelect);
Vue.component("multiselect", Multiselect);

//Vue.use(VueAutosuggest);

Vue.config.productionTip = false;

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL;

const i18n = new VueI18n({
  messages, // set locale messages
  locale: "en", // set locale
  fallbackLocale: process.env.VUE_APP_DEFAULT_FALLBACK_LOCALE
});

new Vue({
  router,
  store,
  i18n,
  beforeCreate() {
    this.$store.commit("initConstants");
    this.$store.commit("initUser");
  },
  render: h => h(App)
}).$mount("#app");
