<template>
  <div class="mt-1" v-cloak>
    <b-row no-gutters class="mb-2" align-v="center">
      <b-col class="pl-2">
        <span class="h5">{{ $t("admin.load_data") }}</span>
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
          @click="uploadData"
          small
          variant="success"
          :disabled="!delimited_data"
          ><b-icon-cloud-upload />{{ $t("admin.upload_data") }}</b-button
        >
      </b-col>
    </b-row>

    <b-form>
      <b-form-row>
        <b-col>
          <b-form-group
            :label="$t('admin.load_data_into_table')"
            label-cols="3"
            for="choose_entity"
            class="horizontal-custom data-loader"
          >
            <b-form-select
              id="choose_entity"
              v-model="entity"
              debounce="200"
              :options="available_entities"
              value-field="name"
              text-field="label"
            >
              <template v-slot:first>
                <b-form-select-option :value="null" disabled
                  >-- Please select a table to load --</b-form-select-option
                >
              </template>
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col class="paste-data">
          <b-form-group
            :disabled="!metadata"
            :label="$t('admin.paste_data')"
            label-cols="3"
            class="textarea-custom data-loader"
          >
            <b-textarea
              v-model="delimited_data"
              placeholder="(paste your data here)"
              rows="3"
              max-rows="6"
            >
            </b-textarea>
          </b-form-group>
          <small>{{ $t("admin.paste_data_description") }}</small>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col class="paste-data">
          <b-form-group
            :label="$t('admin.mode')"
            label-cols="3"
            for="load_mode"
            class="horizontal-custom data-loader margin0"
          >
            <b-form-select id="load_mode" v-model="mode" debounce="200">
              <b-form-select-option value="insert">insert</b-form-select-option>
              <b-form-select-option value="update">update</b-form-select-option>
            </b-form-select>
          </b-form-group>
          <small>{{ $t("admin.mode_description") }}</small>
        </b-col>
      </b-form-row>
    </b-form>

    <b-card nobody v-if="metadata">
      <b-tabs card>
        <b-tab title="Table Help" :active="!load_results">
          <b-card-text
            >Available fields on the
            <span class="text-primary">{{ entityLabel }}</span>
            table.</b-card-text
          >
          <b-table
            :items="metadata.columns"
            :fields="column_display_fields"
            small
            borderless
            striped
          ></b-table>
          <small v-if="mode === 'insert'"
            >If you include a <code>key</code> column in your data, it must be
            provided on every row. If you prefer to have id/keys auto-generated,
            omit the column.</small
          >
          <small v-if="mode === 'update'"
            >The <code>key</code> column is required in update mode. If a key
            does not reference existing data, it will be skipped.</small
          >
          <b-form-group
            label="Spreadsheet Headers"
            label-cols="3"
            class="horizontal-custom data-loader margin0 pt20"
          >
            <b-input readonly type="text" v-model="fieldHeaders" />
          </b-form-group>
          <small
            >For convenience, you can copy these headers into your
            spreadsheet.</small
          >
        </b-tab>

        <b-tab title="Results" :active="load_results">
          <b-row v-if="load_results" class="text-center">
            <b-col
              ><span class="h5 text-primary">{{ load_results.total }}</span>
              rows processed</b-col
            >
            <b-col v-if="mode === 'insert'"
              ><span class="h5 text-success">{{ load_results.inserted }}</span>
              inserted</b-col
            >
            <b-col v-if="mode === 'update'"
              ><span class="h5 text-success">{{ load_results.updated }}</span>
              updated</b-col
            >
            <b-col
              ><span class="h5 text-danger">{{ load_results.skipped }}</span>
              skipped</b-col
            >
          </b-row>
          <b-row v-if="load_results && load_results.warnings">
            <b-col>
              <b-list-group>
                <b-list-group-item
                  variant="warning"
                  v-for="(w, idx) in load_results.warnings"
                  :key="idx"
                  >{{ w }}</b-list-group-item
                >
              </b-list-group>
            </b-col>
          </b-row>
        </b-tab>
      </b-tabs>
    </b-card>

    <b-row no-gutters class="mb-2" align-v="center">
      <b-col class="pl-2">
        <span class="h5">{{ $t("admin.export_table") }}</span>
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
    </b-row>

    <b-form>
      <b-form-row>
        <b-col>
          <b-form-group
            :label="$t('admin.select_table_to_export')"
            label-cols="3"
            for="choose_entity"
            class="horizontal-custom export-table"
          >
            <b-form-select
              id="choose_entity"
              v-model="export_entity"
              debounce="200"
              :options="available_entities"
              value-field="name"
              text-field="label"
            >
              <template v-slot:first>
                <b-form-select-option :value="null" disabled
                  >-- Please select a table to export --</b-form-select-option
                >
              </template>
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col class="text-right">
          <b-button
            @click="exportData"
            small
            variant="success"
            :disabled="!export_entity"
            ><b-icon-cloud-upload /> {{ $t("admin.export_data") }}</b-button
          >
        </b-col>
      </b-form-row>
    </b-form>
  </div>
</template>

<script>
import Vue from "vue";
import ApiHandlingMixin from "../mixins/ApiHandlingMixin.js";
import helpers from "../helpers";

export default {
  name: "DataLoader",
  data() {
    return {
      available_entities: [
        { name: "brand", label: "brand" },
        { name: "category", label: "category" },
        { name: "certificate", label: "certificate" },
        { name: "custom_attribute", label: "custom attribute" },
        { name: "product_custom_attribute", label: "product custom attribute" },
        { name: "equipment", label: "equipment" },
        { name: "equipment_group", label: "equipment group" },
        { name: "equipment_image", label: "equipment image" },
        { name: "equipment_type", label: "equipment type" },
        { name: "family", label: "family" },
        { name: "family_group", label: "family group" },
        { name: "filter", label: "filter" },
        { name: "filter_option", label: "filter option" },
        { name: "group", label: "group" },
        { name: "image_type", label: "image type" },
        { name: "lifecycle", label: "lifecycle" },
        { name: "product", label: "product" },
        { name: "product_certificate", label: "product certificate" },
        {
          name: "product_equipment_connect",
          label: "product equipment connect"
        },
        { name: "product_family_connect", label: "product family connect" },
        { name: "product_image", label: "product image" },
        { name: "product_oem_reference", label: "product oem reference" },
        { name: "product_filter_option", label: "product filter option" },
        { name: "product_set", label: "product set" },
        { name: "product_type", label: "product type" },
        { name: "supplier", label: "supplier" },
        { name: "pet", label: "pet (testing)" }
      ],
      entity: null,
      export_entity: null,
      metadata: null,
      column_display_fields: [
        { key: "column", label: "Name" },
        { key: "sql_type", label: "Data Type" },
        { key: "pk", label: "Is Key" }
      ],
      delimited_data: "",
      mode: "insert",
      load_results: null
    };
  },
  mixins: [ApiHandlingMixin],
  computed: {
    entityLabel: function() {
      if (!this.entity) return "";
      return this.available_entities.find(e => {
        return e.name === this.entity;
      }).label;
    },
    fieldHeaders: function() {
      if (!this.metadata) return "";
      return this.metadata.columns
        .reduce((prev, c) => {
          return prev + c.column + "\t";
        }, "")
        .trim();
    }
  },
  watch: {
    entity: function() {
      this.loadTableMetadata();
      this.load_results = null;
    },
    delimited_data: function() {
      this.load_results = null;
    }
  },
  created: async function() {
    this.$router.app.selectedMenu = "dataloader";
    this.available_entities = await Vue.mtapi.getDataTables();
  },
  methods: {
    copyFieldsToClipboard: function() {
      let copyText = document.querySelector("#allfields");
      copyText.select();
      document.execCommand("copy");
    },
    uploadData: async function() {
      try {
        this.in_process++;
        let apiresp = null;
        if (this.mode === "insert") {
          apiresp = await Vue.mtapi.bulkInsert(
            this.entity,
            this.delimited_data
          );
        } else if (this.mode === "update") {
          apiresp = await Vue.mtapi.bulkUpdate(
            this.entity,
            this.delimited_data
          );
        }
        this.load_results = apiresp;
      } catch (ex) {
        this.handleApiError(ex);
      } finally {
        this.in_process--;
      }
    },

    loadTableMetadata: async function() {
      try {
        if (!this.entity) {
          this.metadata = [];
          return;
        }
        this.in_process++;
        this.message = "Loading...";
        this.metadata = await Vue.mtapi.getTableMetadata(this.entity);
      } catch (ex) {
        this.handleApiError(ex);
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    getPlural: function(name) {
      if (name == "category") return "categories";
      if (name == "family") return "families";
      return name + "s";
    },
    exportData: async function() {
      let res = await Vue.mtapi.exportTable(this.export_entity);
      helpers.exportCSVFile(
        res.headers[0],
        res[this.getPlural(this.export_entity)],
        this.export_entity
      );
    }
  }
};
</script>
<style lang="scss">
.data-loader {
  legend {
    background: #cc0003;
    color: white;
  }
}
.paste-data {
  margin-bottom: 1rem;
}
.textarea-custom {
  margin-bottom: 0px !important;
  legend {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #9bb6c4;
    border-right: none;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  .bv-no-focus-ring {
    padding-left: 0px !important;

    textarea {
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
    }
  }
}
.margin0 {
  margin: 0px !important;
}
.table-striped tbody tr:nth-of-type(odd) {
  background-color: #ffedee;
}
.pt20 {
  padding-top: 20px;
}
.card {
  margin-bottom: 20px;
}
.export-table {
  legend {
    background-color: #4b9a01;
    color: white;
  }
}
</style>
