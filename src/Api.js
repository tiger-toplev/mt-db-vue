import lodash from "lodash";
/**
 * API class for calling Medten site APIs.
 */
export class Api {
  constructor(base_url) {
    if (!base_url) {
      throw new ApiError(`A base url is required.`);
    }
    this.base_url = base_url;
    this.api_key = null;
    this.account_id = null;
  }

  //Auth

  async login(fields) {
    return await this._put(`${this.base_url}/auth/login`, fields);
  }

  //
  // GET methods
  //
  async getBrands() {
    let result = await this._get(`${this.base_url}/brands`, {
      limit: 1000,
      order_by: "+name_en"
    });
    return result.brands;
  }
  async getCategories() {
    let result = await this._get(`${this.base_url}/categories`, {
      limit: 1000,
      order_by: "+name_en"
    });
    return result.category_views;
  }
  async getCertificates() {
    let result = await this._get(`${this.base_url}/certificates`, {
      limit: 1000,
      order_by: "+name_en"
    });
    return result.certificates;
  }
  async getCustomAttributesForCategory(category_id) {
    let query = {
      category_id: category_id,
      limit: 1000,
      order_by: "+category_id,+name_en"
    };
    let result = await this._get(`${this.base_url}/custom_attributes`, query);
    return result.custom_attributes;
  }
  async getEquipmentList(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+model" };
    return await this._get(`${this.base_url}/equipment`, qopts);
  }
  async searchEquipmentList(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+model" };
    return await this._post(`${this.base_url}/equipment/search`, qopts);
  }
  async getEquipment(id) {
    let result = await this._get(`${this.base_url}/equipment/${id}`);
    return result;
  }
  async getEquipmentImages(id) {
    let result = await this._get(`${this.base_url}/equipment/${id}/images`);
    return result.equipment_images;
  }
  async getEquipmentAvailableRegions(id) {
    let result = await this._get(
      `${this.base_url}/equipment/${id}/available_regions`
    );
    return result.equipment_available_region_views;
  }
  async getEquipmentGroups(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+model,+group_code" };
    let result = await this._get(`${this.base_url}/equipment_groups`, qopts);
    return result.equipment_group_views;
  }
  async getEquipmentTypes(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+name_en" };
    let result = await this._get(`${this.base_url}/equipment_types`, qopts);
    return result.equipment_types;
  }
  async getAllEquipmentModels() {
    let result = await this._get(`${this.base_url}/equipment_models`);
    return result.equipment_models;
  }
  async getFamilies(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+family_code" };
    let result = await this._get(`${this.base_url}/families`, qopts);
    return result;
  }
  async searchFamilies(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+family_code" };
    let result = await this._post(`${this.base_url}/families/search`, qopts);
    return result;
  }
  async getFamiliesForBrand(brand_id) {
    let query = { brand_id: brand_id, limit: 1000, order_by: "+family_code" };
    let result = await this._get(`${this.base_url}/families`, query);
    return result.family_views;
  }
  async getFamily(id) {
    let result = await this._get(`${this.base_url}/families/${id}`);
    return result;
  }
  async getFamilyImages(id) {
    let result = await this._get(`${this.base_url}/families/${id}/images`);
    return result.family_image_views;
  }
  async getGroup(id) {
    let result = await this._get(`${this.base_url}/groups/${id}`);
    return result;
  }
  async getGroups(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+group_code" };
    return await this._get(`${this.base_url}/groups`, qopts);
  }
  async searchGroups(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+group_code" };
    return await this._post(`${this.base_url}/groups/search`, qopts);
  }
  async getGroupEquipment(group_id, qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+group_id,+model" };
    let result = await this._get(
      `${this.base_url}/groups/${group_id}/equipment`,
      qopts
    );
    return result.equipment_group_views;
  }
  async getFilterOptionViewsForCategory(category_id) {
    let query = {
      category_id: category_id,
      limit: 1000,
      order_by: "+category_id,+filter_id"
    };
    let result = await this._get(`${this.base_url}/filter_option_views`, query);
    return result.filter_option_views;
  }
  async getImageTypes() {
    let result = await this._get(`${this.base_url}/image_types`, {
      limit: 1000,
      order_by: "+name"
    });
    return result.image_types;
  }
  async getLifecycles() {
    let result = await this._get(`${this.base_url}/lifecycles`, {
      limit: 1000,
      order_by: "+name_en"
    });
    return result.lifecycles;
  }
  async getPackagingFactors() {
    let result = await this._get(`${this.base_url}/packaging_factors`, {
      limit: 1000,
      order_by: "+name"
    });
    let sorted = lodash.sortBy(result.packaging_factors, pf => {
      return pf.value * 1 || pf.name;
    });
    return sorted;
  }
  async getProducts(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+name_en" };
    let result = await this._get(`${this.base_url}/products`, qopts);
    return result;
  }
  async searchProducts(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+name_en" };
    let result = await this._post(`${this.base_url}/products/search`, qopts);
    return result;
  }
  async getProduct(id) {
    let result = await this._get(`${this.base_url}/products/${id}`);
    return result;
  }
  async getProductCertificates(id) {
    let result = await this._get(
      `${this.base_url}/products/${id}/certificates`
    );
    return result.product_certificates;
  }

  async getProductCustomAttributes(id) {
    let result = await this._get(
      `${this.base_url}/products/${id}/custom_attributes`
    );
    return result.product_custom_attribute_views;
  }
  async getProductSkus() {
    let result = await this._get(`${this.base_url}/products/skus`);
    return result;
  }

  /**
   * @param {number} product_id product id
   */
  async getProductEquipment(product_id) {
    let result = await this._get(
      `${this.base_url}/products/${product_id}/equipment`
    );
    return result.product_equipment_connect_views;
  }

  /**
   * @param {number} product_id product id
   */
  async getProductFamilies(product_id) {
    let result = await this._get(
      `${this.base_url}/products/${product_id}/families`
    );
    return result.product_family_connects;
  }

  async getProductFilterOptions(id) {
    let result = await this._get(
      `${this.base_url}/products/${id}/filter_options`
    );
    return result.product_filter_option_views; //this api method returns a view object
  }

  async getProductSuppliers(id) {
    let result = await this._get(`${this.base_url}/products/${id}/suppliers`);
    return result.product_suppliers;
  }

  async getProductImages(id) {
    let result = await this._get(`${this.base_url}/products/${id}/images`);
    return result.product_image_views;
  }

  async getProductMarketingRegions(id) {
    let result = await this._get(
      `${this.base_url}/products/${id}/marketing_regions`
    );
    return result.product_marketing_region_views;
  }

  async getProductOemReferences(id) {
    let result = await this._get(
      `${this.base_url}/products/${id}/oem_references`
    );
    return result.product_oem_references;
  }
  async getProductSets(id) {
    let result = await this._get(`${this.base_url}/products/${id}/sets`);
    return result.product_set_views;
  }
  async getProductTypes() {
    let result = await this._get(`${this.base_url}/product-types`, {
      limit: 100,
      order_by: "+name_en"
    });
    return result.product_types;
  }
  async getProductView(id) {
    let result = await this._get(`${this.base_url}/products/view/${id}`);
    return result;
  }
  async getSuppliers() {
    let result = await this._get(`${this.base_url}/suppliers`, {
      limit: 100,
      order_by: "+name_en"
    });
    return result.suppliers;
  }
  async getDataTables() {
    let result = await this._get(`${this.base_url}/dataload/tables`);
    return result.tables;
  }
  async getTableMetadata(entity) {
    let result = await this._get(
      `${this.base_url}/dataload/${entity}/metadata`
    );
    return result;
  }

  async getExportProducts(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+name_en" };
    let result = await this._post(
      `${this.base_url}/products/search/download`,
      qopts
    );
    return result;

    // if (!qopts) qopts = { limit: 1000, order_by: "+name_en" };

    // let result = await this.doFetchCSV(
    //   "GET",
    //   `${this.base_url}/products/search/download`,
    //   { body: qopts }
    // );
    // return result;
  }

  async getExportGroups(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+name_en" };
    let result = await this._post(
      `${this.base_url}/groups/search/download`,
      qopts
    );
    return result;
  }

  async getExportFamilies(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+name_en" };
    let result = await this._post(
      `${this.base_url}/families/search/download`,
      qopts
    );
    return result;
  }

  async getExportEquipments(qopts) {
    if (!qopts) qopts = { limit: 1000, order_by: "+name_en" };
    let result = await this._post(
      `${this.base_url}/equipment/search/download`,
      qopts
    );
    return result;
  }

  /**
   * Sets credentials to be used for API calls
   * @param {object} credentials
   * @param {number} credentials.account_id (required) identifies the principal's account
   * @param {string} credentials.api_key (required) the api key granted access to the API (via login process or assigned)
   */
  setCredentials(credentials) {
    console.log("set credentials");
    if (!credentials || !credentials.account_id || !credentials.api_key) {
      throw new ApiError("Insufficient credentials.");
    }
    this.api_key = credentials.api_key;
    this.account_id = credentials.account_id;
  }

  //
  // other API methods
  //
  _formatBasicAuth() {
    return `Basic  ${btoa(this.account_id + ":" + this.api_key)}`;
  }

  /** Perform a bulk insert (assume text encoded data) */
  async bulkInsert(entity, data) {
    let url = `${this.base_url}/dataload/${entity}/bulkinsert`;
    try {
      let fetchOpts = {
        method: "POST",
        headers: new Headers({
          "Content-Type": "text/plain"
        }),
        body: data
      };
      if (this.api_key) {
        fetchOpts.headers.append("Authorization", this._formatBasicAuth());
      }
      let response = await fetch(url, fetchOpts);
      if ([401, 403].indexOf(response.status) >= 0) {
        throw new ApiAuthorizationError("Unauthorized.");
      }
      let responseData = await response.json();
      if ([400, 500].indexOf(response.status) >= 0) {
        let msg = `${responseData.message || ""} ${responseData.error ||
          ""}`.trim();
        throw new ApiError(msg);
      } else {
        return responseData;
      }
    } catch (ex) {
      if (ex instanceof ApiAuthorizationError) throw ex;
      console.error(ex);
      console.error(`POST ${url} error. ${ex.message}`);
      throw new ApiError(ex.message);
    }
  }

  /** Perform a bulk update (assume text encoded data) */
  async bulkUpdate(entity, data) {
    let url = `${this.base_url}/dataload/${entity}/bulkupdate`;
    try {
      let fetchOpts = {
        method: "POST",
        headers: new Headers({
          "Content-Type": "text/plain"
        }),
        body: data
      };
      if (this.api_key) {
        fetchOpts.headers.append("Authorization", this._formatBasicAuth());
      }
      let response = await fetch(url, fetchOpts);
      if ([401, 403].indexOf(response.status) >= 0) {
        throw new ApiAuthorizationError("Unauthorized.");
      }
      let responseData = await response.json();
      if ([400, 500].indexOf(response.status) >= 0) {
        let msg = `${responseData.message || ""} ${responseData.error ||
          ""}`.trim();
        throw new ApiError(msg);
      } else {
        return responseData;
      }
    } catch (ex) {
      if (ex instanceof ApiAuthorizationError) throw ex;
      console.error(ex);
      console.error(`POST ${url} error. ${ex.message}`);
      throw new ApiError(ex.message);
    }
  }

  /** Perform a bulk download */
  async exportTable(entity) {
    let url = `${this.base_url}/dataload/${entity}/download`;
    try {
      let fetchOpts = {
        method: "GET",
        headers: new Headers({
          "Content-Type": "text/json"
        })
      };
      if (this.api_key) {
        fetchOpts.headers.append("Authorization", this._formatBasicAuth());
      }
      let response = await fetch(url, fetchOpts);
      if ([401, 403].indexOf(response.status) >= 0) {
        throw new ApiAuthorizationError("Unauthorized.");
      }
      let responseData = await response.json();
      if ([400, 500].indexOf(response.status) >= 0) {
        let msg = `${responseData.message || ""} ${responseData.error ||
          ""}`.trim();
        throw new ApiError(msg);
      } else {
        return responseData;
      }
    } catch (ex) {
      if (ex instanceof ApiAuthorizationError) throw ex;
      console.error(ex);
      console.error(`POST ${url} error. ${ex.message}`);
      throw new ApiError(ex.message);
    }
  }

  //
  // SAVE methods
  //
  async saveEquipment(equipment) {
    if (equipment.id) {
      return await this._put(
        `${this.base_url}/equipment/${equipment.id}`,
        equipment
      );
    } else {
      return await this._post(`${this.base_url}/equipment`, equipment);
    }
  }

  /**
   *
   * @param {number} equipment_id
   * @param {array} images array of image objects
   */
  async saveEquipmentImages(equipment_id, images) {
    return await this._post(
      `${this.base_url}/equipment/${equipment_id}/images`,
      images
    );
  }

  /**
   *
   * @param {number} equipment_id
   * @param {array} regions array of regions objects
   */
  async saveEquipmentAvailableRegions(equipment_id, regions) {
    return await this._post(
      `${this.base_url}/equipment/${equipment_id}/available_regions`,
      regions
    );
  }

  async saveGroup(group) {
    if (group.id) {
      return await this._put(`${this.base_url}/groups/${group.id}`, group);
    } else {
      return await this._post(`${this.base_url}/groups`, group);
    }
  }
  async saveGroupEquipment(group_id, equipment_ids) {
    let payload = equipment_ids.map(eqid => {
      return {
        group_id: group_id,
        equipment_id: eqid
      };
    });
    return await this._post(
      `${this.base_url}/groups/${group_id}/equipment`,
      payload
    );
  }

  async saveFamily(family) {
    if (family.id) {
      return await this._put(`${this.base_url}/families/${family.id}`, family);
    } else {
      return await this._post(`${this.base_url}/families`, family);
    }
  }

  async saveProduct(product) {
    if (product.id) {
      return await this._put(
        `${this.base_url}/products/${product.id}`,
        product
      );
    } else {
      return await this._post(`${this.base_url}/products`, product);
    }
  }

  /**
   *
   * @param {number} product_id
   * @param {array} certificate_ids array of certificate ids
   */
  async saveProductCertificates(product_id, certificate_ids) {
    let payload = certificate_ids.map(cid => {
      return {
        product_id: product_id,
        certificate_id: cid
      };
    });
    return await this._post(
      `${this.base_url}/products/${product_id}/certificates`,
      payload
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} cust_attr array of custom attribute objects
   */
  async saveProductCustomAttributes(product_id, cust_attr) {
    return await this._post(
      `${this.base_url}/products/${product_id}/custom_attributes`,
      cust_attr
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} equips array of equipment ids
   */
  async saveProductEquipment(product_id, equips) {
    let payload = equips.map(eqid => {
      return {
        product_id: product_id,
        equipment_id: eqid
      };
    });
    return await this._post(
      `${this.base_url}/products/${product_id}/equipment`,
      payload
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} family_ids array of family ids
   */
  async saveProductFamilies(product_id, family_ids) {
    let payload = family_ids.map(fid => {
      return {
        product_id: product_id,
        family_id: fid
      };
    });
    return await this._post(
      `${this.base_url}/products/${product_id}/families`,
      payload
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} filter_options array of filter option objects
   */
  async saveProductFilterOptions(product_id, filter_options) {
    let with_ids = filter_options.filter(obj => {
      return obj.filter_option_id ? true : false;
    });
    return await this._post(
      `${this.base_url}/products/${product_id}/filter_options`,
      with_ids
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} suppliers array of supplier objects
   */
  async saveProductSuppliers(product_id, suppliers) {
    return await this._post(
      `${this.base_url}/products/${product_id}/suppliers`,
      suppliers
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} images array of image objects
   */
  async saveProductImages(product_id, images) {
    return await this._post(
      `${this.base_url}/products/${product_id}/images`,
      images
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} regions array of region objects
   */
  async saveProductMarketingRegions(product_id, regions) {
    return await this._post(
      `${this.base_url}/products/${product_id}/marketing_regions`,
      regions
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} oem_refs array of oem ref objects
   */
  async saveProductOemReferences(product_id, oem_refs) {
    return await this._post(
      `${this.base_url}/products/${product_id}/oem_references`,
      oem_refs
    );
  }

  /**
   *
   * @param {number} product_id
   * @param {array} sets array of set objects
   */
  async saveProductSets(product_id, sets) {
    return await this._post(
      `${this.base_url}/products/${product_id}/sets`,
      sets
    );
  }

  //common methods.
  async _get(url, parms) {
    return await this.doFetch("GET", url, { parms: parms });
  }
  async _post(url, body) {
    return await this.doFetch("POST", url, { body: body });
  }
  async _put(url, body) {
    return await this.doFetch("PUT", url, { body: body });
  }
  async _delete(url, parms) {
    return await this.doFetch("DELETE", url, { parms: parms });
  }
  async doFetch(method, url, payload) {
    if (payload && payload.parms) {
      if (payload.parms) {
        let searchParams = new URLSearchParams();
        for (let key in payload.parms) {
          searchParams.append(key, payload.parms[key]);
        }
        let search = searchParams.toString();
        if (search) url += "?" + search;
      }
    }
    let data = {};
    try {
      let fetchOpts = {
        method: method,
        headers: new Headers({
          "Content-Type": "application/json"
        })
      };
      if (this.api_key) {
        fetchOpts.headers.set("Authorization", this._formatBasicAuth());
      }
      if (method === "POST" || method === "PUT") {
        if (payload && payload.body) {
          fetchOpts.body = JSON.stringify(payload.body);
        }
      }
      let response = await fetch(url, fetchOpts);
      if ([401, 403].indexOf(response.status) >= 0) {
        throw new ApiAuthorizationError("Unauthorized.");
      } else if ([400, 500].indexOf(response.status) >= 0) {
        data = await response.json();
      } else if (response.ok) {
        data = await response.json();
      }
      return data;
    } catch (ex) {
      if (ex instanceof ApiAuthorizationError) throw ex;
      console.error(ex);
      console.error(`${method} ${url} error. ${ex.message}`);
      throw new ApiError(ex.message);
    }
  }

  async doFetchCSV(method, url, payload) {
    if (payload && payload.parms) {
      if (payload.parms) {
        let searchParams = new URLSearchParams();
        for (let key in payload.parms) {
          searchParams.append(key, payload.parms[key]);
        }
        let search = searchParams.toString();
        if (search) url += "?" + search;
      }
    }
    let data = {};
    try {
      let fetchOpts = {
        method: method,
        headers: new Headers({
          "Content-Type": "text/csv"
        })
      };
      if (this.api_key) {
        fetchOpts.headers.set("Authorization", this._formatBasicAuth());
      }
      if (method === "POST" || method === "PUT") {
        if (payload && payload.body) {
          fetchOpts.body = JSON.stringify(payload.body);
        }
      }
      let response = await fetch(url, fetchOpts);
      if ([401, 403].indexOf(response.status) >= 0) {
        throw new ApiAuthorizationError("Unauthorized.");
      } else if ([400, 500].indexOf(response.status) >= 0) {
        data = await response.json();
      } else if (response.ok) {
        data = await response.body.getReader();
      }
      return data;
    } catch (ex) {
      if (ex instanceof ApiAuthorizationError) throw ex;
      console.error(ex);
      console.error(`${method} ${url} error. ${ex.message}`);
      throw new ApiError(ex.message);
    }
  }

  /**
   * Support usage as a Vue plugin. You can use the
   * "mtapi" global inside any Vue instance to make Medten API
   * calls.
   * @param {object} Vue vue instance
   * @param {*} opts (currently unused)
   */
  install(Vue) {
    Vue.mtapi = this;
  }
}
/**
 * API-related error.
 */
export class ApiError extends Error {}
export class ApiAuthorizationError extends Error {}
