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
        <b-table
          id="search-table"
          hover
          :items="products"
          :fields="fields"
          :busy.sync="busy"
          empty-text="No products found."
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
            @change="searchProducts"
            min="10"
            step="1"
          >
          </b-form-input>
        </b-input-group>
        {{ $t("general.of") }} {{ total }} {{ $t("product.label") }}
        {{ $t("general.results") }}
      </b-col>
      <b-col class="text-center" cols="5">
        <b-pagination
          v-model="currentPage"
          :total-rows="total"
          :per-page="limit"
          aria-controls="search-table"
          @input="searchProducts"
          :limit="6"
          :prev-text="$t('general.prev')"
          :next-text="$t('general.next')"
        ></b-pagination>
      </b-col>
      <b-col cols="3">
        <b-button @click="exportCurrentResults" variant="success" small
          >{{ $t("general.export") }} {{ limit }} {{ $t("general.current") }}
          {{ $t("general.results") }}</b-button
        >
      </b-col>
    </b-row>
    <b-row>
      <b-col class="text-center">
        <b-button @click="exportAllResults" variant="success" small
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
  name: "ProductList",
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
      products: [],
      limit: 10,
      total: 0,
      fields: [
        { key: "id", sortable: true },
        { key: "name_en", label: "Title", sortable: true },
        { key: "sku", label: "SKU", sortable: true },
        { key: "oem", label: "OEM", sortable: true },
        { key: "oem_brand_en", label: "OEM Brand", sortable: true },
        { key: "category_en", label: "SubCategory", sortable: true }
        // { key: "category_zh", label: "Category (Chinese)", sortable: true }
      ],
      currentPage: 1,
      selected: null,
      search_term: "",
      search_term_fields: [],
      category_id: [],
      search_filter: "",
      search_filter_value: null,
      sortBy: "sku",
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
    console.error("ProductList Error", component, info);
    console.error(err);
    this.error = err.message;
    return false;
  },
  mounted: async function() {
    this.currentPage = 1;
    console.log("ProductList props keyword", this.keyword);
    console.log(
      "ProductList props primary_search_field",
      this.primary_search_field
    );
    console.log("ProductList props search_category", this.search_category);
    console.log(
      "ProductList props keywsecondary_search_filterord",
      this.secondary_search_filter
    );
    console.log("ProductList props option_select", this.option_select);

    this.search_term = this.keyword;
    this.search_term_fields = this.primary_search_field;
    this.category_id = this.search_category;
    this.search_filter = this.secondary_search_filter;
    this.search_filter_value = this.option_select;

    await this.searchProducts();

    EventBus.$on(
      "product_search",
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
        console.log(
          "subscribe in Product List",
          this.keyword,
          this.search_term_fields,
          this.category_id,
          this.search_filter,
          this.search_filter_value
        );
        this.searchProducts();
      }
    );
  },
  methods: {
    searchProducts: async function() {
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
          this.category_id && this.category_id[0] != 0 ? this.category_id : "";
        query.search_filter = this.search_filter;
        query.search_filter_value = this.search_filter_value
          ? this.search_filter_value
          : "";

        console.log(
          "Product List",
          this.search_term,
          this.search_term_fields,
          this.category_id,
          this.search_filter,
          this.search_filter_value
        );

        let apiresp = await Vue.mtapi.searchProducts(query);
        this.products = apiresp.product_views;
        this.total = apiresp.total;
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get products. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
      }
    },
    onRowSelected(items) {
      let selected = items[0];
      this.$router.push({ path: `/product/${selected.id}` });
    },
    sortChanged(e) {
      this.sortBy = e.sortBy;
      this.sortDesc = e.sortDesc;
      this.searchProducts();
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

        const res = await Vue.mtapi.getExportProducts(query);
        helpers.exportCSVFile(res.headers[0], res.product_views, "products");
        // let anchor = document.createElement('a');
        // anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(res);
        // anchor.target = '_blank';
        // anchor.download = 'nameYourFileHere.csv';
        // anchor.click();
        // window.open(
        //   "https://mgtwitxxi1.execute-api.ap-southeast-1.amazonaws.com/Prod/api/v1/products/search/download"
        // );
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get products. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
      }
    },
    async exportAllResults() {
      let res = await Vue.mtapi.exportTable("product");
      helpers.exportCSVFile(res.headers[0], res["products"], "all_products");
    }
    // convertToCSV(objArray) {
    //   var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    //   var str = "";

    //   for (var i = 0; i < array.length; i++) {
    //     var line = "";
    //     for (var index in array[i]) {
    //       if (line != "") line += ",";

    //       line += array[i][index];
    //     }

    //     str += line + "\r\n";
    //   }

    //   return str;
    // },

    // exportCSVFile(headers, items, fileTitle) {
    //   if (headers) {
    //     items.unshift(headers);
    //   }

    //   // Convert Object to JSON
    //   var jsonObject = JSON.stringify(items);

    //   var csv = this.convertToCSV(jsonObject);

    //   var exportedFilenmae = fileTitle + ".csv" || "export.csv";

    //   var blob = new Blob(["\uFEFF" + csv], {
    //     type: "text/csv;charset=utf-8;"
    //   });
    //   if (navigator.msSaveBlob) {
    //     // IE 10+
    //     navigator.msSaveBlob(blob, exportedFilenmae);
    //   } else {
    //     var link = document.createElement("a");
    //     if (link.download !== undefined) {
    //       // feature detection
    //       // Browsers that support HTML5 download attribute
    //       var url = URL.createObjectURL(blob);
    //       console.log("url", url, exportedFilenmae, csv);
    //       link.setAttribute("href", url);
    //       link.setAttribute("download", exportedFilenmae);
    //       link.style.visibility = "hidden";
    //       document.body.appendChild(link);
    //       link.click();
    //       document.body.removeChild(link);
    //     }
    //   }
    // },

    // download() {
    //   var headers = {
    //     model: "Phone Model".replace(/,/g, ""), // remove commas to avoid errors
    //     chargers: "Chargers",
    //     cases: "Cases",
    //     earphones: "Earphones"
    //   };

    //   let itemsNotFormatted = [
    //     {
    //       model: "Samsung S7",
    //       chargers: "55",
    //       cases: "56",
    //       earphones: "57",
    //       scratched: "2"
    //     },
    //     {
    //       model: "Pixel XL",
    //       chargers: "77",
    //       cases: "78",
    //       earphones: "79",
    //       scratched: "4"
    //     },
    //     {
    //       model: "iPhone 7",
    //       chargers: "88",
    //       cases: "89",
    //       earphones: "90",
    //       scratched: "6"
    //     }
    //   ];

    //   var itemsFormatted = [];

    //   // format the data
    //   itemsNotFormatted.forEach(item => {
    //     itemsFormatted.push({
    //       model: item.model.replace(/,/g, ""), // remove commas to avoid errors,
    //       chargers: item.chargers,
    //       cases: item.cases,
    //       earphones: item.earphones
    //     });
    //   });

    //   var fileTitle = "orders"; // or 'my-unique-title'

    //   this.exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
    // }
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
