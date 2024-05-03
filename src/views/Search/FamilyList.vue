<template>
  <div>
    <b-row>
      <b-col>
        <b-alert v-if="!busy && hasError" variant="danger">{{ error }}</b-alert>
        <b-alert v-if="!busy && hasMessage" variant="info">{{
          message
        }}</b-alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-alert v-if="!busy && error" variant="danger">{{ error }}</b-alert>
        <b-alert v-if="!busy && message" variant="info">{{ message }}</b-alert>
        <b-table
          id="search-table"
          hover
          :items="families"
          :fields="fields"
          :busy.sync="busy"
          empty-text="No families found."
          show-empty
          selectable
          no-local-sorting
          @sort-changed="sortChanged"
          @row-selected="onRowSelected"
        >
          <template v-slot:table-busy>
            <b-row class="d-flex justify-content-center"
              ><b-spinner variant="secondary" center
            /></b-row>
          </template>

          <template v-slot:cell(image_link_connector_distal)="data">
            <img v-if="data.value" :src="data.value" width="50" height="50" />
          </template>
        </b-table>
      </b-col>
    </b-row>

    <b-row class="table-controls">
      <b-col cols="4" class="show-quantity">
        {{ $t("general.displaying") }}
        <b-input-group prepend="Qty">
          <b-form-input
            v-model="limit"
            type="number"
            :number="true"
            @change="searchFamilies"
            min="10"
            step="1"
          >
          </b-form-input>
        </b-input-group>
        {{ $t("general.of") }} {{ total }} {{ $t("family.label") }}
        {{ $t("general.results") }}
      </b-col>
      <b-col class="text-center" cols="5">
        <b-pagination
          v-model="currentPage"
          :total-rows="total"
          :per-page="limit"
          aria-controls="search-table"
          @input="searchFamilies"
          :limit="6"
          :prev-text="$t('general.prev')"
          :next-text="$t('general.next')"
        ></b-pagination>
      </b-col>
      <b-col cols="3">
        <b-button
          class="custom-btn"
          @click="exportCurrentResults"
          variant="success"
          small
          >{{ $t("general.export") }} {{ limit }} {{ $t("general.current") }}
          {{ $t("general.results") }}</b-button
        >
      </b-col>
    </b-row>
    <b-row>
      <b-col class="text-center">
        <b-button
          class="custom-btn"
          @click="exportAllResults"
          variant="success"
          small
          >{{ $t("general.export") }} {{ total }}
          {{ $t("general.results") }}</b-button
        >
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Vue from "vue";
import { EventBus } from "@/event-bus.js";
import { ApiError } from "../../Api.js";
import helpers from "../../helpers";

export default {
  name: "FamilyList",
  props: {
    page: { type: Number, required: false },
    keyword: { type: String, default: "", required: false },
    primary_search_field: { type: String, default: "", required: false },
    search_category: { type: Array, required: false },
    secondary_search_filter: { type: String, default: "", required: false },
    option_select: { type: String, default: "", required: false }
  },
  data() {
    return {
      message: null,
      error: null,
      in_process: 0,
      limit: 10,
      total: 0,
      families: [],
      fields: [
        { key: "id", sortable: true },
        { key: "family_code", label: "Family Code", sortable: true },
        { key: "title", label: "Family Title", sortable: true },
        {
          key: "image_link_connector_distal",
          label: "Family Image",
          sortable: true
        },
        {
          key: "family_connector_code",
          label: "Connector Code",
          sortable: true
        }
      ],
      currentPage: 1,
      selected: null,
      search_term: "",
      search_term_fields: [],
      category_id: [],
      search_filter: "",
      search_filter_value: null,
      sortBy: "family_code",
      sortDesc: false
    };
  },
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
  errorCaptured: function(err, component, info) {
    console.error("FamilyList Error", component, info);
    console.error(err);
    this.error = err.message;
    return false;
  },
  mounted: async function() {
    this.currentPage = 1;
    this.search_term = this.keyword;
    this.search_term_fields = this.primary_search_field;
    this.category_id = this.search_category;
    this.search_filter = this.secondary_search_filter;
    this.search_filter_value = this.option_select;
    await this.searchFamilies();

    EventBus.$on(
      "family_search",
      (
        page,
        keyword,
        primary_search_field,
        search_category,
        secondary_search_filter,
        option_select
      ) => {
        this.currentPage = page;
        this.search_term = keyword;
        this.search_term_fields = primary_search_field;
        this.category_id = search_category;
        this.search_filter = secondary_search_filter;
        this.search_filter_value = option_select;

        this.searchFamilies();
      }
    );
  },
  methods: {
    searchFamilies: async function() {
      this.in_process++;
      try {
        this.error, (this.message = null);
        let query = {
          offset:
            this.currentPage && this.currentPage > 0
              ? (this.currentPage - 1) * this.limit
              : 0,
          limit: this.limit,
          order_by: [(this.sortDesc == false ? "+" : "-") + this.sortBy]
        };
        query.search_term = this.search_term;
        query.search_term_fields = this.search_term_fields;

        query.category_id =
          this.category_id && this.category_id[0] != 0 ? this.category_id : "";
        query.search_filter = this.search_filter;
        query.search_filter_value = this.search_filter_value
          ? this.search_filter_value
          : "";

        let apiresp = await Vue.mtapi.searchFamilies(query);
        this.families = apiresp.family_views;
        this.total = apiresp.total;
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get families. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
      }
    },
    onRowSelected(items) {
      let selected = items[0];
      this.$router.push({ path: `/family/${selected.id}` });
    },
    sortChanged(e) {
      this.sortBy = e.sortBy;
      this.sortDesc = e.sortDesc;
      this.searchFamilies();
    },
    async exportCurrentResults() {
      this.in_process++;
      try {
        let query = {
          offset:
            this.currentPage && this.currentPage > 0
              ? (this.currentPage - 1) * this.limit
              : 0,
          limit: this.limit,
          order_by: [(this.sortDesc == false ? "+" : "-") + this.sortBy]
        };
        query.search_term = this.search_term;
        query.search_term_fields = this.search_term_fields;

        query.category_id =
          this.category_id && this.category_id[0] != 0
            ? this.category_id
            : undefined;
        query.search_filter = this.search_filter;
        query.search_filter_value = this.search_filter_value
          ? this.search_filter_value
          : 3;

        const res = await Vue.mtapi.getExportFamilies(query);
        helpers.exportCSVFile(res.headers[0], res.product_views, "families");
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get families. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
      }
    },
    async exportAllResults() {
      let res = await Vue.mtapi.exportTable("family");
      helpers.exportCSVFile(res.headers[0], res["families"], "all_families");
    }
  }
};
</script>
<style lang="scss">
.table-controls {
  margin-bottom: 20px;
  .show-quantity {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .input-group {
      margin: 0px 5px;
      max-width: 120px !important;

      .input-group-text {
        background-color: #fff2ce;
      }
    }
  }
  ul {
    margin: 0px;
  }
}
</style>
