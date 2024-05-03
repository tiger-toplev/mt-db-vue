<template>
  <div class="mt-1" v-cloak>
    <b-row no-gutters class="mb-2" align-v="center">
      <b-col class="pl-2" style="flex: 2">
        <span v-cloak class="h5 equip-heading" v-if="equipment && equipment.id"
          >{{ $t("equipment.editing") }}: {{ equipment.model }}</span
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
          @click="saveAllEquipmentData"
          :disabled="busy || is_code_invalid"
        >
          <b-icon-cloud-upload />&nbsp;{{ $t("general.save") }}
        </b-button>
      </b-col>
    </b-row>

    <b-form v-if="equipment">
      <b-form-row>
        <b-col cols="6">
          <b-form-group
            :label="$t('equipment.model')"
            label-cols="4"
            class="horizontal-custom equip-form"
          >
            <!-- <b-form-input v-model="equipment.model" /> -->
            <vue-simple-suggest
              v-model="equipment.model"
              :list="all_equipment_models"
              :filter-by-query="true"
            >
            </vue-simple-suggest>
            <div v-if="is_code_invalid" class="alert alert-warning">
              Equipment Model you want to create already exists!
            </div>
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group
            :label="$t('equipment.brand')"
            label-cols="4"
            class="horizontal-custom equip-form"
          >
            <b-form-select
              v-model="equipment.brand_id"
              :options="$store.state.brands"
              value-field="id"
              text-field="name_en"
            >
              <template v-slot:first>
                <b-form-select-option value="">{{
                  $t("general.choose")
                }}</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col cols="6">
          <b-form-group
            :label="$t('equipment.equipment_type')"
            label-cols="4"
            class="horizontal-custom equip-form"
          >
            <b-form-select
              v-model="equipment.equipment_type_id"
              :options="$store.state.equipment_types"
              value-field="id"
              text-field="name_en"
            >
              <template v-slot:first>
                <b-form-select-option value="">{{
                  $t("general.choose")
                }}</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col cols="6" v-if="equipment_available_regions">
          <b-form-group
            id="g_e_available_regions"
            :label="$t('equipment.available_region')"
            label-for="e_available_regions"
            label-align="left"
            label-cols="4"
          >
            <b-form-checkbox-group
              id="e_available_regions"
              v-model="equipment_available_regions"
              :options="all_equipment_available_regions"
              value-field="id"
              text-field="name"
              :disabled="busy"
            >
            </b-form-checkbox-group>
            <!-- <multiselect
              id="p_marketing_regions"
              v-model="equipment_available_regions"
              placeholder="Search Marketing Regions"
              label="name"
              track-by="code"
              :options="all_equipment_available_regions"
              :multiple="true"
            ></multiselect> -->
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>

    <b-form v-if="equipment">
      <b-form-row>
        <b-col>
          <b-form-group
            v-if="equipment_groups.length > 0"
            :label="$t('equipment.is_part_equipment_groups')"
            label-cols="4"
          >
            <b-badge
              :href="'/group/' + equip_group.group_id"
              target="_blank"
              v-for="(equip_group, idx) in equipment_groups"
              :key="idx"
              variant="light"
              pill
              >{{ equip_group.group_code }}</b-badge
            >
            <span v-if="equipment_groups.length === 0"
              >Not currently associated with any groups.</span
            >
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>

    <div
      class="section"
      v-if="this.$route.params.id && this.$route.params.id != 'new'"
    >
      <div class="toggle-icon" @click="toggleSection">
        <b-icon-caret-up-fill v-if="hide_section" />&nbsp;
        <b-icon-caret-down-fill v-else />&nbsp;
      </div>
      <div v-if="hide_section">
        <b-form-row>
          <b-col cols="12">
            <strong
              >{{ $t("equipment.equipment_images") }} ({{
                equipment_images.length
              }})</strong
            >
          </b-col>
        </b-form-row>
      </div>
      <template v-else>
        <template v-if="equipment_images">
          <b-form v-for="(fimage, idx) in equipment_images" :key="idx">
            <b-form-row>
              <b-col cols="6">
                <b-form-group
                  :label="$t('equipment.image_link')"
                  label-align="right"
                  label-cols="6"
                >
                  <b-form-input
                    v-model="fimage.image_link"
                    type="text"
                    placeholder="url for the image"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col cols="4">
                <b-img
                  :src="validateImage(fimage.image_link)"
                  width="120"
                  height="80"
                  right
                />
              </b-col>
              <b-col cols="2">
                <b-button
                  @click="removeEquipmentImage(idx)"
                  variant="outline-danger"
                  size="sm"
                  >Delete</b-button
                >
              </b-col>
            </b-form-row>
          </b-form>
        </template>
        <b-button
          variant="outline-success"
          v-if="this.$route.params.id && this.$route.params.id != 'new'"
          @click="newEquipmentImage"
          size="sm"
          >{{ $t("equipment.add_image") }}</b-button
        >
      </template>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { ApiError } from "@/Api.js";
//import Multiselect from "vue-multiselect";

export default {
  name: "EquipmentForm",
  data() {
    return {
      message: null,
      error: null,
      in_process: 0,
      equipment: null,

      equipment_groups: [],
      equipment_images: null,
      equipment_available_regions: null,
      all_equipment_available_regions: [
        { name: "USA", code: "us", id: 1 },
        { name: "EU", code: "eu", id: 2 },
        { name: "China", code: "zh", id: 3 },
        { name: "Latin America", code: "la", id: 4 },
        { name: "Asia (outside of China)", code: "as", id: 5 }
      ],
      all_equipment_models: [],
      is_code_invalid: false,
      original_equipment_model: null,
      hide_section: false
    };
  },
  components: {
    //Multiselect
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
    }
  },
  watch: {
    async $route(to, from) {
      if (to.params != from.params) {
        await this.loadData();
      }
    },
    "equipment.model": {
      handler: function() {
        console.log("this.equipment.model", this.equipment.model);
        if (this.equipment.model === this.original_equipment_model)
          return (this.is_code_invalid = false);
        let flag = false;
        this.all_equipment_models.map(item => {
          let models = item.split("-");
          if (models[0] == this.equipment.model) flag = true;
        });
        this.is_code_invalid = flag;
        // this.is_code_invalid = this.all_equipment_models.includes(
        //   this.equipment.model
        // )
        //   ? true
        //   : false;
      }
    }
  },
  created: async function() {
    this.$router.app.selectedMenu = "equipment";
    await this.loadData();
    // this.all_equipment_models = this.$store.state.equipments.map(
    //   equipment => equipment.model
    // );
    const res = await Vue.mtapi.getAllEquipmentModels();
    this.all_equipment_models = res.map(item => {
      return item.model + "-" + item.brand_en;
    });
    //this.all_equipment_models = [];
  },
  methods: {
    loadData: async function() {
      try {
        this.message = "Loading...";
        this.error = null;

        await this.loadEquipment();

        if (!this.$route.params.id || this.$route.params.id === "new") {
          this.equipment_images = [];
        } else {
          await this.loadEquipmentImages();
        }

        await Promise.all([
          this.loadEquipmentGroups(),
          this.loadEquipmentAvailableRegions()
        ]);
        this.message = "";
      } catch (err) {
        this.error = `Couldn't load equipment data.`;
        console.error(err);
      }
    },

    loadEquipment: async function() {
      if (!this.$route.params.id || this.$route.params.id === "new") {
        this.equipment = {};
        return;
      }
      try {
        this.in_process++;
        this.message = "Loading...";
        this.equipment = await Vue.mtapi.getEquipment(this.$route.params.id);
        this.original_equipment_model = this.equipment.model;
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load equipment.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadEquipmentImages: async function() {
      if (this.equipment_images !== null) return; //Otherwise server overwrites work
      try {
        this.error = null;
        this.message = "Loading images...";
        this.in_process++;
        this.equipment_images = await Vue.mtapi.getEquipmentImages(
          this.$route.params.id
        );
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get product images. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.message = "";
        this.in_process--;
      }
    },
    loadEquipmentAvailableRegions: async function() {
      if (this.equipment_available_regions !== null) return; //Otherwise server overwrites work
      try {
        this.error = null;
        this.message = "Loading marketing regions...";
        this.in_process++;
        const res = await Vue.mtapi.getEquipmentAvailableRegions(
          this.$route.params.id
        );
        this.equipment_available_regions = res.map(
          item => item.available_region_id
        );
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get marketing regions. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.message = "";
        this.in_process--;
      }
    },
    loadEquipmentGroups: async function() {
      if (!this.equipment || !this.equipment.id) return;
      try {
        this.in_process++;
        this.equipment_groups = await Vue.mtapi.getEquipmentGroups({
          equipment_id: this.equipment.id,
          order_by: "+model",
          limit: 100
        });
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load groups for the equipment.";
      } finally {
        this.in_process--;
      }
    },
    saveAllEquipmentData: async function() {
      try {
        this.message = "Saving...";
        await this.saveEquipment();

        console.log(this.equipment_available_regions);
        await Promise.all([
          this.saveEquipmentImages(),
          this.saveEquipmentAvailableRegions()
        ]);
      } catch (ex) {
        this.message = "Error saving equipment.";
        this.error = ex.message;
      }
    },
    saveEquipment: async function() {
      this.in_process++;
      this.message = "Saving equipment...";
      try {
        this.equipment = await Vue.mtapi.saveEquipment(this.equipment);
        this.original_equipment_model = this.equipment.model;
        this.$emit("equipment-changed", this.equipment.id);
      } catch (ex) {
        this.message = "Error saving equipment.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveEquipmentImages: async function() {
      if (this.equipment_images === null) return;
      this.in_process++;
      this.message = "Saving images...";
      try {
        await Vue.mtapi.saveEquipmentImages(
          this.equipment.id,
          this.equipment_images
        );
      } catch (ex) {
        this.message = "Error saving images.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveEquipmentAvailableRegions: async function() {
      if (this.equipment_available_regions === null) return;

      let params = this.equipment_available_regions.map(region_id => {
        return {
          equipment_id: this.equipment.id,
          available_region_id: region_id
        };
      });

      this.in_process++;
      this.message = "Saving marketing regions...";
      try {
        await Vue.mtapi.saveEquipmentAvailableRegions(
          this.equipment.id,
          params
        );
      } catch (ex) {
        this.message = "Error saving marketing regions.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    validateImage: function(img) {
      let VALID_IMG = /http[s]?:\/\/[\w-\.\/]*\.(gif|jpeg|jpg|png)/;
      if (VALID_IMG.test(img)) {
        return img;
      }
      return "";
    },
    newEquipmentImage: function() {
      this.equipment_images.push({
        equipment_id: this.equipment.id,
        image_type_id: null,
        image_link: null
      });
    },
    removeEquipmentImage: function(idx) {
      if (idx >= 0) this.equipment_images.splice(idx, 1);
    },
    toggleSection: function() {
      this.hide_section = !this.hide_section;
    }
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss">
.filters-div {
  width: 100%;
}

.section {
  min-height: 50px;
  position: relative;
  border: 2px solid #9bb6c4;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 15px;

  .images-section {
    display: flex;
    > div {
      flex: 1;
    }
  }
}
.toggle-icon {
  position: absolute;
  right: 5px;
  top: 0;
  cursor: pointer;
}
.equip-heading {
  padding: 5px 20px;
  background-color: #fff3d4;
  border: 2px solid #af8b61;
  border-radius: 5px;
}
.equip-form {
  legend {
    background-color: #fff2ce;
    border: 2px solid #af8b61 !important;
    border-right: 2px solid #af8b61 !important;
    color: #af8b61;
  }
  input {
    height: calc(1.5em + 0.75rem + 2px);
    border-bottom-left-radius: 0px !important;
    border-top-left-radius: 0px !important;
    border: 2px solid #af8b61 !important;
    border-left: none !important;
  }
  select {
    border: 2px solid #af8b61 !important;
  }
  .bv-no-focus-ring {
    //display: flex;
    align-items: center;
  }
}
</style>
