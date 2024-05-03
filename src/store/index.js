import Vue from "vue";
import Vuex from "vuex";
import { VueOfflineStorage } from "vue-offline";
import UsersStore from "./modules/users";
import ProductsStore from "./modules/products";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    users: UsersStore,
    products: ProductsStore
  },
  state: {
    brands: [],
    categories: [],
    certificates: [],
    equipment_types: [],
    families: [],
    groups: [],
    image_types: [],
    lifecycles: [],
    packaging_factors: [],
    product_types: [],
    suppliers: []
  },
  mutations: {
    async initConstants(state) {
      let brands = VueOfflineStorage.get("brands")
        ? VueOfflineStorage.get("brands")
        : [];
      let categories = VueOfflineStorage.get("categories")
        ? VueOfflineStorage.get("categories")
        : [];
      let certificates = VueOfflineStorage.get("certificates")
        ? VueOfflineStorage.get("certificates")
        : [];
      let equipment_types = VueOfflineStorage.get("equipment_types")
        ? VueOfflineStorage.get("equipment_types")
        : [];
      let families = VueOfflineStorage.get("families")
        ? VueOfflineStorage.get("families")
        : [];
      let groups = VueOfflineStorage.get("groups")
        ? VueOfflineStorage.get("groups")
        : [];
      let image_types = VueOfflineStorage.get("image_types")
        ? VueOfflineStorage.get("image_types")
        : [];
      let lifecycles = VueOfflineStorage.get("lifecycles")
        ? VueOfflineStorage.get("lifecycles")
        : [];
      let packaging_factors = VueOfflineStorage.get("packaging_factors")
        ? VueOfflineStorage.get("packaging_factors")
        : [];
      let product_types = VueOfflineStorage.get("product_types")
        ? VueOfflineStorage.get("product_types")
        : [];
      let suppliers = VueOfflineStorage.get("suppliers")
        ? VueOfflineStorage.get("suppliers")
        : [];

      if (
        brands.length === 0 ||
        categories.length === 0 ||
        certificates.length === 0 ||
        equipment_types.length === 0 ||
        families.length === 0 ||
        groups.length === 0 ||
        image_types.length === 0 ||
        lifecycles.length === 0 ||
        packaging_factors.length === 0 ||
        product_types.length === 0 ||
        suppliers.length === 0
      ) {
        await reloadData();
      }

      if (brands) {
        this.replaceState({
          ...state,
          brands,
          categories,
          certificates,
          equipment_types,
          families,
          groups,
          image_types,
          lifecycles,
          packaging_factors,
          product_types,
          suppliers
        });
      }
      console.log("vuex state", state);
    },
    clearStore() {
      localStorage.removeItem("brands");
      localStorage.removeItem("categories");
      localStorage.removeItem("certificates");
      localStorage.removeItem("equipment_types");
      localStorage.removeItem("families");
      localStorage.removeItem("groups");
      localStorage.removeItem("image_types");
      localStorage.removeItem("lifecycles");
      localStorage.removeItem("packaging_factors");
      localStorage.removeItem("product_types");
      localStorage.removeItem("suppliers");
      localStorage.removeItem("VueOfflineStorageKeys");
      localStorage.removeItem("store");
      localStorage.removeItem("apikey");
      localStorage.removeItem("account_id");
    }
  },
  actions: {
    simulateLogout({ commit }) {
      commit("clearStore");
    }
  }
});

let loadBrands = async function() {
  try {
    let brands = await Vue.mtapi.getBrands();
    if (brands) {
      VueOfflineStorage.set("brands", brands);
      //Vue.storage.setBrands(this.brands);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading brands.";
  }
};

let loadCategories = async function() {
  try {
    let categories = await Vue.mtapi.getCategories();
    if (categories) {
      VueOfflineStorage.set("categories", categories);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading categories.";
  }
};
let loadCertificates = async function() {
  try {
    let certificates = await Vue.mtapi.getCertificates();
    if (certificates) {
      VueOfflineStorage.set("certificates", certificates);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading certificates.";
  }
};

let loadEquipmentTypes = async function() {
  try {
    let equipment_types = await Vue.mtapi.getEquipmentTypes();
    if (equipment_types) {
      VueOfflineStorage.set("equipment_types", equipment_types);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading equipment types.";
  }
};

let loadFamilies = async function() {
  try {
    let apiResp = await Vue.mtapi.getFamilies();
    let families = apiResp.family_views;
    if (families) {
      VueOfflineStorage.set("families", families);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading families.";
  }
};

let loadGroups = async function() {
  try {
    let apiResp = await Vue.mtapi.getGroups();
    let groups = apiResp.groups;
    if (groups) {
      VueOfflineStorage.set("groups", groups);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading groups.";
  }
};

let loadImageTypes = async function() {
  try {
    let image_types = await Vue.mtapi.getImageTypes();
    if (image_types) {
      VueOfflineStorage.set("image_types", image_types);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading image type.";
  }
};

let loadLifecycles = async function() {
  try {
    let lifecycles = await Vue.mtapi.getLifecycles();
    if (lifecycles) {
      VueOfflineStorage.set("lifecycles", lifecycles);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading lifecycles.";
  }
};

let loadProductTypes = async function() {
  try {
    let product_types = await Vue.mtapi.getProductTypes();
    if (product_types) {
      VueOfflineStorage.set("product_types", product_types);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading product types.";
  }
};

let loadSuppliers = async function() {
  try {
    let suppliers = await Vue.mtapi.getSuppliers();
    if (suppliers) {
      VueOfflineStorage.set("suppliers", suppliers);
    }
  } catch (ex) {
    console.error(ex);
    this.error = "Error loading suppliers.";
  }
};

let loadPackagingFactors = async function() {
  try {
    let packaging_factors = await Vue.mtapi.getPackagingFactors();
    if (packaging_factors) {
      VueOfflineStorage.set("packaging_factors", packaging_factors);
    }
  } catch (ex) {
    console.error(ex);
    let error = "Error loading packaging factors.";
    console.log(error);
  }
};

let reloadData = async function() {
  try {
    await Promise.all([
      loadBrands(),
      loadCategories(),
      loadCertificates(),
      loadEquipmentTypes(),
      loadFamilies(),
      loadGroups(),
      loadImageTypes(),
      loadPackagingFactors(),
      loadLifecycles(),
      loadProductTypes(),
      loadSuppliers()
    ]);
  } catch (err) {
    console.error(err);
  }
};
