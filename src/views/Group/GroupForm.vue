<template>
  <div class="mt-1" v-cloak>
    <b-row no-gutters class="mb-2" align-v="center">
      <b-col class="pl-2">
        <span v-cloak class="h5 group-heading" v-if="group && group.id"
          >{{ $t("group.editing") }}: {{ group.group_code }}</span
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
          @click="saveAllGroupData"
          :disabled="busy || is_code_invalid"
        >
          <b-icon-cloud-upload />&nbsp;{{ $t("general.save") }}
        </b-button>
      </b-col>
    </b-row>

    <b-form v-if="group">
      <b-form-row>
        <b-col cols="4">
          <b-form-group
            :label="$t('group.group_code')"
            label-cols="4"
            class="horizontal-custom group-form"
          >
            <!-- <b-form-input v-model="group.group_code" /> -->
            <vue-simple-suggest
              v-model="group.group_code"
              :list="all_group_codes"
              :filter-by-query="true"
            >
            </vue-simple-suggest>
          </b-form-group>
          <div v-if="is_code_invalid" class="alert alert-warning">
            Group Code you want to create already exists!
          </div>
        </b-col>
        <b-col cols="6" v-if="family">
          <b-form-group
            :label="$t('group.family_title')"
            label-cols="4"
            class="horizontal-custom title-form"
          >
            <b-form-input disabled v-model="family.title_en"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col cols="2" v-if="family">
          <b-link :href="'/family/' + group.family_id" target="_blank">{{
            family.family_code
          }}</b-link>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col cols="6">
          <b-form-group
            :label="$t('group.equipment_models')"
            label-cols="4"
            for="eqlisttext"
            class="horizontal-custom equip-model"
          >
            <vue-single-select
              v-model="selected_equipment"
              :options="all_equipments"
              option-label="model_brand"
              :maxResults="-1"
            ></vue-single-select>
            <b-button variant="success" @click="addGroupEquipment()" size="sm"
              >{{ $t("general.add") }}
            </b-button>
            <!-- <b-form-input
              placeholder="model / brand"
              @input="filter_as_typed"
              v-model="filter"
              debounce="200"
            ></b-form-input>
            <b-list-group>
              <b-list-group-item
                action
                v-for="(equip, idx) in equip_filtered"
                :key="idx"
                @click="selectEquipment(equip)"
                >{{ equip.label }}</b-list-group-item
              >
            </b-list-group> -->
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group
            :label="$t('group.equipment_in_group')"
            label-cols="4"
            class="equip-in-group"
          >
            <span class="h6">
              <b-badge
                :href="'/equipment/' + grequip.equipment_id"
                target="_blank"
                variant="light"
                v-for="(grequip, idx) in group_equipment"
                :key="idx"
                pill
                >{{ grequip.model }}
                <b-icon-x
                  variant="danger"
                  @click="removeGroupEquipment(grequip)"
                ></b-icon-x>
              </b-badge>
            </span>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "GroupForm",
  data() {
    return {
      message: null,
      error: null,
      in_process: 0,
      group: null,
      filter: "",
      equip_filtered: [], //holds equipment data
      equipments: [],
      group_equipment: [],
      all_group_codes: [],
      is_code_invalid: false,
      original_group_code: null,
      selected_equipment: null,
      family: null
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
    all_equipments: function() {
      return this.equipments.map(item => {
        return { ...item, model_brand: item.model + " / " + item.brand_en };
      });
    }
  },
  watch: {
    async $route(to, from) {
      if (to.params != from.params) {
        await this.loadData();
      }
    },
    "group.group_code": {
      handler: function() {
        if (this.group.group_code === this.original_group_code)
          return (this.is_code_invalid = false);
        this.is_code_invalid = this.all_group_codes.includes(
          this.group.group_code
        )
          ? true
          : false;
      }
    }
  },
  created: async function() {
    this.$router.app.selectedMenu = "group";
    await this.loadData();
    this.all_group_codes = this.$store.state.groups.map(
      group => group.group_code
    );
  },
  methods: {
    filter_as_typed: function(v) {
      if (!v) {
        this.equip_filtered = [];
        return;
      }
      this.equip_filtered = this.equipments.filter(function(eq) {
        return (
          eq.model.includes(v) ||
          eq.brand_en.includes(v) ||
          eq.brand_zh.includes(v)
        );
      });
    },
    selectEquipment(equipment) {
      this.filter = equipment.id;
      this.equip_filtered = [];
    },
    addGroupEquipment() {
      let equipment = this.selected_equipment;

      let self = this;
      if (equipment) {
        let existing = this.group_equipment.find(function(ge) {
          return (
            ge.equipment_id == equipment.id && ge.group_id == self.group.id
          );
        });
        if (!existing) {
          this.group_equipment.push({
            model: equipment.model,
            equipment_id: equipment.id,
            group_id: self.group.id
          });
        }
      }
      this.selected_equipment = null;
    },
    removeGroupEquipment(grequip) {
      let self = this;
      if (grequip) {
        let existingIdx = this.group_equipment.findIndex(function(ge) {
          return (
            ge.equipment_id == grequip.equipment_id &&
            ge.group_id == self.group.id
          );
        });
        if (existingIdx >= 0) {
          this.group_equipment.splice(existingIdx, 1);
        }
      }
    },
    loadData: async function() {
      try {
        this.message = "Loading...";
        this.error = null;

        await this.loadGroup();
        //this.group.family_id = 238;
        await Promise.all([
          this.loadEquipments(),
          this.loadFamily(),
          this.loadGroupEquipment()
        ]);
      } catch (err) {
        this.error = `Couldn't load group data.`;
        console.error(err);
      }
    },
    loadFamily: async function() {
      try {
        if (!this.group || !this.group.family_id) return;
        if (this.family && this.family.id == this.group.family_id) return;
        this.in_process++;
        this.message = "Loading...";
        this.family = await Vue.mtapi.getFamily(this.group.family_id);
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load family.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadEquipments: async function() {
      try {
        this.in_process++;
        let apiresp = await Vue.mtapi.getEquipmentList({ limit: 1000 });
        this.equipments = apiresp.equipment_views;
        //decorate with label
        this.equipments.forEach(eq => {
          eq.label = `${eq.model} / ${eq.brand_en}`;
        });
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load equipment.";
      } finally {
        this.in_process--;
      }
    },
    loadGroup: async function() {
      try {
        if (!this.$route.params.id || this.$route.params.id === "new") {
          this.group = {};
          return;
        }
        this.in_process++;
        this.message = "Loading...";
        this.group = await Vue.mtapi.getGroup(this.$route.params.id);
        this.original_group_code = this.group.group_code;
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load group.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadGroupEquipment: async function() {
      if (!this.group || !this.group.id) return;
      try {
        this.in_process++;
        this.group_equipment = await Vue.mtapi.getGroupEquipment(
          this.group.id,
          {
            order_by: "+model",
            limit: 100
          }
        );
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load equipment for the group.";
      } finally {
        this.in_process--;
      }
    },
    saveAllGroupData: async function() {
      try {
        this.message = "Saving...";
        await this.saveGroup();

        await Promise.all([this.saveGroupEquipment()]);
      } catch (ex) {
        this.message = "Error saving group.";
        this.error = ex.message;
      }
    },
    saveGroup: async function() {
      this.in_process++;
      this.message = "Saving group...";
      try {
        this.group = await Vue.mtapi.saveGroup(this.group);
        this.original_group_code = this.group.group_code;
        this.$emit("group-changed", this.group.id);
      } catch (ex) {
        this.message = "Error saving group.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveGroupEquipment: async function() {
      this.in_process++;
      this.message = "Saving equipment...";
      try {
        await Vue.mtapi.saveGroupEquipment(
          this.group.id,
          this.group_equipment.map(eg => {
            return eg.equipment_id;
          })
        );
      } catch (ex) {
        this.message = "Error saving equipment for group.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    }
  }
};
</script>
<style lang="scss">
.group-form {
  legend {
    background-color: #ff7f00;
    border: 2px solid #af8b61 !important;
    border-right: 2px solid #af8b61 !important;
    color: white;
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
}

.equip-model {
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
    width: 300px;
  }
  select {
    border: 2px solid #af8b61 !important;
  }
  .bv-no-focus-ring {
    display: flex;
    justify-content: space-between;
  }
  button {
    height: 40px;
    width: 60px;
    margin-right: 20px;
  }
}

.title-form {
  legend {
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
.equip-in-group {
  .badge-light {
    padding: 10px !important;
    background-color: #fff2ce !important;
    margin-right: 10px;
  }
}
.group-heading {
  padding: 5px 20px;
  background-color: #ff7f00;
  border: 2px solid #af8b61;
  border-radius: 5px;
  color: white;
}
</style>
