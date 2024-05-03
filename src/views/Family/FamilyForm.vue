<template>
  <div class="mt-1" v-cloak>
    <b-row no-gutters class="mb-2" align-v="center">
      <b-col class="pl-2">
        <span v-cloak class="h5 family-heading" v-if="family && family.id"
          >{{ $t("family.editing") }}: {{ family.family_code }}</span
        >
      </b-col>
      <b-col>
        <b-spinner small variant="secondary" v-if="busy" />
        <span class="p2 text-info" v-if="hasMessage" variant="info">{{
          message
        }}</span>
        <span
          class="p2 text-danger"
          v-if="!busy && hasError"
          variant="danger"
          >{{ error }}</span
        >
      </b-col>
      <b-col class="text-right">
        <b-button
          small
          variant="success"
          @click="saveAllFamilyData"
          :disabled="busy || is_code_invalid"
        >
          <b-icon-cloud-upload />&nbsp;{{ $t("general.save") }}
        </b-button>
      </b-col>
    </b-row>

    <b-form v-if="family">
      <b-form-row>
        <b-col cols="8">
          <b-form-group id="g_p_name_en" description="" label-for="p_name_en">
            <b-input-group class="title-form" :prepend="$t('family.title')">
              <b-form-input
                id="p_name_en"
                v-model="family.name_en"
                placeholder="derived by formula"
                trim
              ></b-form-input>
              <b-button
                @click="handleCreateTitleClick('en')"
                :disabled="!hasNameFormula || !products || products.length == 0"
                class="custom-btn"
                variant="outline-dark"
                >{{ $t("family.create_title") }}</b-button
              >
            </b-input-group>
          </b-form-group>
        </b-col>

        <b-col cols="4">
          <b-form-group
            :label="$t('family.family_code')"
            label-cols="4"
            class="horizontal-custom custom-blue"
          >
            <!-- <b-form-input v-model="family.family_code" /> -->
            <!-- <vue-bootstrap-typeahead
              :data="all_family_codes"
              v-model="family.family_code"
              ref="townTypeahead"
              @hit="hitCode"
            >
            </vue-bootstrap-typeahead> -->
            <!-- <vue-single-select
              v-model="family.family_code"
              :options="all_family_codes"
              :required="true"
            ></vue-single-select>
            <vue-autosuggest 
                :suggestions="[{data:all_family_codes}]"
                :onSelected="clickHandler"
                :initialValue="family.family_code"
                :inputProps="{id:'autosuggest__input', onInputChange: this.onInputChange}"
            /> -->
            <vue-simple-suggest
              v-model="family.family_code"
              :list="all_family_codes"
              :filter-by-query="true"
            >
            </vue-simple-suggest>
            <div v-if="is_code_invalid" class="alert alert-warning">
              {{ $t("family.family_code_exists") }}
            </div>
          </b-form-group>
        </b-col>
      </b-form-row>

      <!-- <b-form-row>
        <b-col>
          <b-form-group id="g_p_name_zh" description="" label-for="p_name_zh">
            <b-input-group class="title-form" prepend="Title (ZH)">
              <b-form-input
                id="p_name_zh"
                v-model="family.name_zh"
                placeholder="derived by formula"
                trim
              ></b-form-input>
              <b-button
                variant="outline-secondary"
                @click="generateName('zh')"
                :disabled="!hasNameFormula"
                class="custom-btn"
                >Create Title</b-button
              >
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row> -->

      <b-form-row>
        <b-col>
          <b-form-group :label="$t('family.product_skus')" label-cols="3">
            <!-- <b-form-tags
              disabled
              :value="product_skus"
              separator=","
              placeholder=""
              tag-variant="light"
            ></b-form-tags> -->
            <template v-if="products">
              <span v-for="(product, idx) in products" :key="idx">
                {{ product.sku ? product.sku : "-No Sku-" }}
                <b-link :href="'/product/' + product.id" target="_blank"
                  ><b-icon-box-arrow-up-right
                /></b-link>
              </span>
            </template>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col cols="6">
          <b-form-group
            :label="$t('family.equipment_group')"
            label-cols="4"
            class="horizontal-custom custom-blue"
          >
            <v-select
              v-model="family.group_id"
              label="group_code"
              :reduce="group => group.id"
              :options="$store.state.groups"
            ></v-select>
            <!-- <b-form-select
              v-model="family.group_id"
              :options="$store.state.groups"
              value-field="id"
              text-field="group_code"
            >
              <template v-slot:first>
                <b-form-select-option value="">{{
                  $t("general.choose")
                }}</b-form-select-option>
              </template>
            </b-form-select> -->
          </b-form-group>
        </b-col>
        <b-col cols="1" v-if="family.group_id">
          <b-link :href="'/group/' + family.group_id" target="_blank"
            ><b-icon-box-arrow-up-right
          /></b-link>
        </b-col>
        <b-col cols="5">
          <b-form-group>
            <b-input-group
              class="title-form"
              :prepend="$t('family.connector_code')"
            >
              <b-form-input v-model="family.family_connector_code" />
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mb-3">
        <b-col cols="8">
          <b-form-group
            :label="$t('family.image_link')"
            label-cols="4"
            class="horizontal-custom title-form custom-blue"
          >
            <b-form-input v-model="family.image_link_connector_distal" />
          </b-form-group>
        </b-col>
        <b-col>
          <b-img
            :src="family.image_link_connector_distal"
            width="120"
            height="80"
            right
          />
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col cols="8">
          <b-form-group
            :label="$t('family.video_link')"
            label-cols="4"
            class="horizontal-custom title-form custom-blue"
          >
            <b-form-input v-model="family.video_link" />
          </b-form-group>
        </b-col>
        <b-col>
          <b-embed
            type="iframe"
            aspect="16by9"
            :src="family.video_link"
            width="120"
            height="80"
            allowfullscreen
          ></b-embed>
        </b-col>
      </b-form-row>

      <!-- <strong>First Product Specifications</strong>

      <b-form-row v-if="family_product_category" class="mt-2">
        <b-col cols="6">
          <b-form-group>
            <b-input-group class="title-form" prepend="Category">
              <b-form-input
                disabled
                v-model="family_product_category[$i18n.locale]"
              ></b-form-input>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-row v-if="family_product_oem_brand" class="mt-2">
        <b-col cols="6">
          <b-form-group>
            <b-input-group class="title-form" prepend="OEM Brand">
              <b-form-input
                disabled
                v-model="family_product_oem_brand[$i18n.locale]"
              ></b-form-input>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-row v-if="family_product_type" class="mt-2">
        <b-col cols="6">
          <b-form-group>
            <b-input-group class="title-form" prepend="Product Type">
              <b-form-input
                disabled
                v-model="family_product_type[$i18n.locale]"
              ></b-form-input>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row> -->

      <b-modal id="title-warning-modal" size="lg" hide-footer>
        <h3 class="text-center">{{ $t("general.warning") }}!!!</h3>
        <div class="d-block text-center">
          {{ $t("family.title_change_message") }}
        </div>
        <p class="mt-3 text-center">{{ $t("family.delete_final") }}</p>
        <div class="control-btn-groups">
          <b-button
            class="mt-3 mr-3 custom-white-btn"
            @click="generateName(button_locale)"
            >{{ $t("product.ok_create_title") }}</b-button
          >
          <b-button
            class="mt-3 custom-white-btn"
            @click="$bvModal.hide('title-warning-modal')"
            >{{ $t("general.cancel") }}</b-button
          >
        </div>
      </b-modal>
    </b-form>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "FamilyForm",
  data() {
    return {
      message: null,
      error: null,
      in_process: 0,

      family: null,
      products: [],
      all_family_codes: [],
      is_code_invalid: false,
      original_family_code: null,
      button_locale: "en"
    };
  },
  //props: {},
  computed: {
    busy: function() {
      return this.in_process > 0;
    },
    hasError: function() {
      return this.error ? true : false;
    },
    hasMessage: function() {
      return this.message ? true : false;
    },
    category: function() {
      console.log("this.products", this.products);
      return this.products && this.products.length
        ? this.$store.state.categories.find(c => {
            return c.id == this.products[0].category_id;
          })
        : null;
    },
    family_product_category: function() {
      if (!this.products || this.products.length === 0) return null;
      return {
        en: this.products[0].category_en,
        zh: this.products[0].category_zh
      };
    },
    family_product_oem_brand: function() {
      if (!this.products || this.products.length === 0) return null;
      return {
        en: this.products[0].oem_brand_en,
        zh: this.products[0].oem_brand_zh
      };
    },
    family_product_type: function() {
      if (!this.products || this.products.length === 0) return null;
      return {
        en: this.products[0].product_type_en,
        zh: this.products[0].product_type_zh
      };
    },
    product_skus: function() {
      if (!this.products || this.products.length === 0) return null;
      return this.products.map(p => {
        return p.sku;
      });
    },
    hasNameFormula: function() {
      console.log("category", this.category);
      return this.category && this.category.family_name_formula;
    }
  },
  watch: {
    async $route(to, from) {
      if (to.params != from.params) {
        await this.loadData();
      }
    },
    family: {
      handler: function() {},
      deep: true
    },
    "family.family_code": {
      handler: function() {
        if (this.family.family_code === this.original_family_code)
          return (this.is_code_invalid = false);
        this.is_code_invalid = this.all_family_codes.includes(
          this.family.family_code
        )
          ? true
          : false;
      }
    }
  },
  created: async function() {
    this.$router.app.selectedMenu = "family";
    await this.loadData();

    this.all_family_codes = this.$store.state.families.map(
      family => family.family_code
    );
  },
  mounted: function() {
    console.log(this.$refs);
  },
  methods: {
    loadProducts: async function() {
      if (!this.family || !this.family.id) return;
      try {
        this.in_process++;
        let apiresp = await Vue.mtapi.getProducts({
          family_id: this.family.id,
          order_by: "+sku",
          limit: 100
        });
        this.products = apiresp.product_views;
        if (this.products.length > 0) {
          this.products[0];
        }
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load products for the family.";
      } finally {
        this.in_process--;
      }
    },

    loadData: async function() {
      try {
        this.message = this.$t("general.loading");
        this.error = null;

        await this.loadFamily();

        await Promise.all([this.loadProducts()]);

        //If master data is missing, emit a reload request from the master app.
        if (this.$store.state.groups.length === 0) {
          this.$emit("reload");
        }
      } catch (err) {
        this.error = `Couldn't load family data.`;
        console.error(err);
      }
    },
    loadFamily: async function() {
      try {
        if (!this.$route.params.id || this.$route.params.id === "new") {
          this.family = {};
          return;
        }
        this.in_process++;
        this.message = this.$t("general.loading");
        this.family = await Vue.mtapi.getFamily(this.$route.params.id);
        this.original_family_code = this.family.family_code;
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load family.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    saveAllFamilyData: async function() {
      try {
        this.message = "Saving...";
        await this.saveFamily();

        //Regenerate the cache.
        //this.$store.state.loadFamilies();
      } catch (ex) {
        this.message = "Error saving family.";
        this.error = ex.message;
      }
    },
    saveFamily: async function() {
      this.in_process++;
      this.message = "Saving family...";
      try {
        this.family = await Vue.mtapi.saveFamily(this.family);
        this.original_family_code = this.family.family_code;
        this.$emit("family-changed", this.family.id);
      } catch (ex) {
        this.message = "Error saving family.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    clickHandler: function(e) {
      console.log("click handler", e);
    },
    onInputChange: function(e) {
      console.log("input change", e);
    },
    handleCreateTitleClick(locale) {
      this.button_locale = locale;
      if (locale == "en" && this.family.name_en) {
        this.$bvModal.show("title-warning-modal");
      } else if (locale == "zh" && this.family.name_zh) {
        this.$bvModal.show("title-warning-modal");
      } else {
        this.generateName(locale);
      }
    },
    generateName(locale) {
      this.$bvModal.hide("title-warning-modal");
      if (this.category.family_name_formula) {
        try {
          let generator = {
            generate: eval(this.category.family_name_formula)
          };
          let context = {
            family: this.family,
            product: this.products[0]
            //filter_options: this.product_filter_options
          };
          this.normalizeEmptyVals(context.family);
          this.normalizeEmptyVals(context.product);
          // context.filter_options.forEach(fo => {
          //   this.normalizeEmptyVals(fo);
          // });
          if (locale === "en") {
            let result = generator.generate(context, "en");
            this.family.name_en = result.replace(/null|undefined/gi, "");
          }
        } catch (ex) {
          console.error(ex);
        }
      }
    },
    normalizeEmptyVals: function(entity) {
      if (!entity) return;
      for (let fld in entity) {
        if (typeof entity[fld] === "undefined") {
          entity[fld] = "";
        } else if (entity[fld] === null) {
          entity[fld] = "";
        }
      }
      return entity;
    }
  }
};
</script>
<style lang="scss">
.title-form {
  .input-group-text {
    background-color: #3d8bcd;
    border: 2px solid #9bb6c4;
    height: calc(1.5em + 0.75rem + 2px);
    color: white;
    font-weight: 600;
  }
  input {
    margin-right: 20px;
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-left: none !important;
  }
}
.horizontal-custom {
  .form-row {
    legend {
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
      padding: 5px 0px 5px 15px;
      height: calc(1.5em + 0.75rem + 2px);
      border: 2px solid #9bb6c4;
      border-right: none;
    }
    .bv-no-focus-ring:not(.col-form-label) {
      padding-left: 0px;
      select {
        border-top-left-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
        border-left: none !important;
      }
    }
  }
}
.custom-blue {
  label,
  legend {
    background-color: #3d8bcd;
    color: white;
    font-weight: 600;
  }
  input.default-input {
    padding: 5px !important;
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
  }
  .vs__dropdown-toggle {
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
  }
  input.vs__search {
    padding: 2px !important;
  }
}
.control-btn-groups {
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-white-btn {
  background-color: white !important;
  color: black !important;
}
.custom-btn {
  height: 35px;
  background-color: #b9d0ef;
  color: #113359;
  font-weight: 500;
  border: 2px solid;
  padding: 0px 10px;
}
label {
  font-weight: 600 !important;
}
.family-heading {
  padding: 5px 20px;
  background-color: #3d8bcd;
  border: 2px solid #9bb6c4;
  border-radius: 5px;
  color: white;
}
</style>
