<template>
  <b-container id="app" class="page-layout">
    <b-row class="navbar">
      <b-link href="#" to="/"
        ><img src="/images/logo_1.jpg" width="150px" />
      </b-link>
      <b-col>
        <b-input-group class="mt-2">
          <b-input
            type="text"
            :placeholder="$t('general.search_placeholder')"
            v-model="search_term"
            v-on:keyup.enter="search"
          />
          <b-input-group-append>
            <b-button variant="outline-primary" @click="search"
              ><b-icon-search></b-icon-search
            ></b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
      <b-col>
        <b-form-group
          id="g_search_type"
          :label="$t('general.search_for') + ':'"
          label-for="search_type"
          label-align="top"
        >
          <b-form-select
            id="search_type"
            v-model="search_type"
            :options="search_types"
            value-field="key"
            text-field="name"
          >
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          id="g_search_field"
          :label="$t('general.fields_to_search') + ':'"
          label-for="search_field"
          label-align="top"
        >
          <!-- <multiselect
            select-Label=""
            selected-Label=""
            deselect-Label=""
            v-model="primary_search_field"
            :options="filtered_primary_search_fields"
            :multiple="true"
            track-by="name"
            :custom-label="customLabel"
            :close-on-select="false"
            :showLabels="false"
            @select="onSelect($event)"
            @remove="onRemove($event)"
          >
            <span
              class="checkbox-label"
              slot="option"
              slot-scope="scope"
              @click.self="select(scope.option)"
            >
              {{ scope.option.name }}
              <input
                class="test"
                type="checkbox"
                v-model="scope.option.checked"
                @focus.prevent
              />
            </span>
          </multiselect> -->
          <treeselect
            v-model="primary_search_field"
            :multiple="true"
            :options="primary_search_fields"
            placeholder="Select search field"
          />
          <!-- <b-form-select
            id="search_field"
            v-model="primary_search_field"
            :options="primary_search_fields"
            value-field="key"
            text-field="name"
          >
          </b-form-select> -->
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          id="g_search_category"
          :label="$t('general.filter_by_category') + ':'"
          label-for="search_category"
          label-align="top"
        >
          <treeselect
            v-model="search_category"
            :disabled="search_type == 'equipment' || search_type == 'group'"
            :multiple="true"
            :options="search_categories"
            placeholder="Select category(s)"
          />
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          id="g_search_field"
          :label="$t('general.search_filter') + ':'"
          label-for="search_field"
          label-align="top"
        >
          <b-form-select
            id="search_field"
            v-model="secondary_search_filter"
            :options="filtered_secondary_search_filters"
            :disabled="search_type == 'group'"
            value-field="key"
            text-field="name"
          >
            <template v-slot:first>
              <b-form-select-option value="">{{
                $t("general.choose")
              }}</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          id="g_search_field"
          :label="$t('general.option_select') + ':'"
          label-for="search_field"
          label-align="top"
        >
          <b-form-select
            id="search_field"
            v-model="option_select"
            :options="option_selects"
            :disabled="search_type == 'group'"
            value-field="id"
            text-field="name"
          >
            <template v-slot:first>
              <b-form-select-option value="">{{
                $t("general.choose")
              }}</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col>
        <b-button
          @click="logout"
          small
          variant="outline-secondary"
          class="mt-2"
        >
          <b-icon-power></b-icon-power><span></span>
        </b-button>
      </b-col>
    </b-row>
    <b-row class="content">
      <div>
        <b-nav class="w-100" variant="light" vertical>
          <b-nav-item to="/product/new" class="add-product-link">{{
            $t("product.add")
          }}</b-nav-item>
          <b-nav-item to="/family/new" class="add-family-link">{{
            $t("family.add")
          }}</b-nav-item>
          <b-nav-item to="/equipment/new" class="add-equip-link">{{
            $t("equipment.add")
          }}</b-nav-item>
          <b-nav-item to="/group/new" class="add-group-link">{{
            $t("group.add")
          }}</b-nav-item>
          <b-nav-item
            to="/dataloader"
            v-if="is_admin"
            class="load-export-data"
            >{{ $t("admin.load_export_data") }}</b-nav-item
          >
          <b-nav-item>
            <b-form-select id="search_field" v-model="lang">
              <b-form-select-option value="zh">Chinese</b-form-select-option>
              <b-form-select-option value="en">English</b-form-select-option>
            </b-form-select></b-nav-item
          >
          <b-col> </b-col>
        </b-nav>
      </div>
      <b-col cols="10">
        <router-view> </router-view>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import AuthRoute from "@/mixins/AuthRoute";
// import the component
import Treeselect from "@riophae/vue-treeselect";
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { EventBus } from "@/event-bus.js";

export default {
  name: "Layout",
  mixins: [AuthRoute],
  data: function() {
    return {
      in_process: 0,
      lang: this.$i18n.locale,
      error: null,
      message: null,
      warranties: [],
      search_term: "",
      search_type: "product",
      search_types: [
        { name: "Product", key: "product" },
        { name: "Family", key: "family" },
        { name: "Equipment", key: "equipment" },
        { name: "Group", key: "group" }
      ],
      primary_search_field: null,
      primary_search_fields: [
        {
          type: "product",
          label: "SKU",
          id: "sku",
          checked: false
        },
        {
          type: "product",
          label: "OEM",
          id: "oem_brand_en",
          checked: false
        },
        {
          type: "product",
          label: "Product Title",
          id: "name_en",
          checked: false
        },
        {
          type: "product",
          label: "Subcategory",
          id: "category_en",
          checked: false
        }
      ],
      all_primary_search_fields: [
        {
          type: "product",
          label: "SKU",
          id: "sku",
          checked: false
        },
        {
          type: "product",
          label: "OEM",
          id: "oem_brand_en",
          checked: false
        },
        {
          type: "product",
          label: "Product Title",
          id: "name_en",
          checked: false
        },
        {
          type: "product",
          label: "Subcategory",
          id: "category_en",
          checked: false
        },
        {
          type: "family",
          label: "Family Code",
          id: "family_code",
          checked: false
        },
        {
          type: "family",
          label: "Brand",
          id: "brand",
          checked: false
        },
        {
          type: "family",
          label: "Family Title",
          id: "family_title",
          checked: false
        },
        {
          type: "family",
          label: "Subcategory",
          id: "subcategory",
          checked: false
        },
        {
          type: "equipment",
          label: "Model",
          id: "model",
          checked: false
        },
        {
          type: "equipment",
          label: "Brand",
          id: "brand",
          checked: false
        },
        {
          type: "equipment",
          label: "Equipment Type",
          id: "equipment_type",
          checked: false
        },
        {
          type: "group",
          label: "Group Code",
          id: "group_code",
          checked: false
        }
      ],
      search_category: [0],
      search_categories: [],
      secondary_search_filter: "brands",
      secondary_search_filters: [
        { type: "product", name: "Brand", key: "brands" },
        { type: "product", name: "Certificate", key: "certificates" },
        { type: "product", name: "Custom Attribute", key: "custom_attributes" },
        { type: "product", name: "Filter", key: "filters" },
        { type: "product", name: "Lifecycle", key: "lifecycles" },
        { type: "product", name: "Marketing Region", key: "marketing_regions" },
        { type: "product", name: "Packaging Factor", key: "packaging_factors" },
        { type: "product", name: "Supplier", key: "suppliers" },
        { type: "product", name: "OEM Reference", key: "oem_references" },
        { type: "product", name: "Set", key: "sets" },
        { type: "product", name: "Product Type", key: "product_types" },
        { type: "family", name: "Brand", key: "brands" },
        { type: "family", name: "Product Type", key: "product_types" },
        { type: "equipment", name: "Brand", key: "brands" },
        { type: "equipment", name: "Equipment Type", key: "equipment_types" },
        { type: "group", name: "Brand", key: "brands" }
      ],
      option_select: 0,
      option_selects: [{ name: "All", id: 0 }]
    };
  },
  components: { Treeselect },
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
    filtered_primary_search_fields: function() {
      return this.primary_search_fields.filter(item => {
        return item.type === this.search_type;
      });
    },
    filtered_secondary_search_filters: function() {
      return this.secondary_search_filters.filter(item => {
        return item.type === this.search_type;
      });
    },
    is_admin: function() {
      return this.$store.state.users.loggedInUser.roles[0] == "admin";
    }
  },
  mounted() {
    let roots = this.ArrayToTreeFormat(this.$store.state.categories);
    roots = this.removeEmptyChildren(roots);

    this.search_categories = [
      {
        children: roots,
        id: 0,
        label: "All"
      }
    ];
    this.search_category = [0];

    let brands = this.$store.state.brands.map(item => {
      return {
        name: item.name_en,
        id: item.id
      };
    });
    this.option_selects = [...this.option_selects, ...brands];

    this.primary_search_field = ["all"];
    this.primary_search_fields = [
      {
        children: this.all_primary_search_fields.filter(item => {
          return item.type === this.search_type;
        }),
        id: "all",
        label: "All"
      }
    ];
  },
  watch: {
    lang: {
      handler: function(val) {
        this.switchLocale(val);
      }
    },
    search_type: {
      handler: function(val) {
        this.primary_search_field = ["all"];
        this.primary_search_fields = [
          {
            children: this.all_primary_search_fields.filter(item => {
              return item.type === val;
            }),
            id: "all",
            label: "All"
          }
        ];
        this.option_select = 0;
      }
    },
    secondary_search_filter: {
      handler: function(val) {
        console.log("filter change", val);

        // switch(val) {
        //   case 'brand':

        // }
        let options = this.$store.state[val].map(item => {
          return {
            name: item.name_en,
            id: item.id
          };
        });
        if (val == "packaging_factors") {
          options = this.$store.state[val].map(item => {
            return {
              name: item.name,
              id: item.id
            };
          });
        }
        this.option_select = 0;
        this.option_selects = [{ name: "All", id: 0 }, ...options];
      }
    }
  },
  methods: {
    logout: function() {
      this.$store.dispatch("simulateLogout");
      this.$router.push({ path: "/" });
    },
    search: async function() {
      let currentPath = this.$router.currentRoute.path;

      let fields_search = [];
      if (this.primary_search_field) {
        if (this.primary_search_field[0] == "all") {
          fields_search = this.primary_search_fields[0].children.map(
            item => item.id
          );
        } else {
          for (let i = 0; i < this.primary_search_field.length; i++) {
            fields_search.push(this.primary_search_field[i]);
          }
        }
      }

      let search_filter_value = this.secondary_search_filter.slice(0, -1);
      console.log(
        "Layout",
        fields_search,
        this.search_category,
        search_filter_value,
        this.option_select
      );

      if (!currentPath.startsWith(`/search/${this.search_type}`)) {
        console.log("route change");
        this.$router.push({
          path: `/search/${this.search_type}`,
          query: {
            page: 1,
            search_term: this.search_term,
            primary_search_field: fields_search,
            search_category: this.search_category,
            secondary_search_filter: search_filter_value,
            option_select: Number(this.option_select)
          }
        });
      } else {
        console.log("same route - emit action");
        EventBus.$emit(
          `${this.search_type}_search`,
          1,
          this.search_term,
          fields_search,
          this.search_category,
          search_filter_value,
          this.option_select
        );
      }
    },
    ArrayToTreeFormat(list) {
      var map = {},
        node,
        roots = [],
        i;
      for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i; // initialize the map
        list[i].children = []; // initialize the children
      }
      for (i = 0; i < list.length; i += 1) {
        node = list[i];
        node.label = node.name_en;
        if (node.parent_id) {
          // if you have dangling branches check that map[node.parent_id] exists
          list[map[node.parent_id]].children.push(node);
        } else {
          roots.push(node);
        }
      }
      return roots;
    },
    removeEmptyChildren(list) {
      list = list.map(item => {
        if (item.children.length) {
          item.children = this.removeEmptyChildren(item.children);
        } else {
          delete item.children;
        }
        return item;
      });
      return list;
    },
    switchLocale(locale) {
      if (this.$i18n.locale !== locale) {
        this.$i18n.locale = locale;
      }
    },
    customLabel(option) {
      return `${option.name}`;
    },
    onSelect(option) {
      console.log("Added");
      option.checked = true;
      console.log(option.name + "  Clicked!! " + option.checked);
    },

    onRemove(option) {
      console.log("Removed");
      option.checked = false;
      console.log(option.name + "  Removed!! " + option.checked);
    },
    select(option) {
      option.selected = !option.selected;
    }
  }
};
</script>
<style lang="scss">
#app {
  max-width: 1500px !important;

  .navbar {
    > .col {
      flex: 1;

      &:last-child {
        flex: 0.2;
      }
    }
  }
}

.page-layout {
  max-width: 1300px !important;
  margin: 0 auto;
  .navbar {
    label {
      font-size: 12px;
      font-weight: bold;
    }
  }
}

.content {
  .nav-item {
    border-radius: 5px;
    margin-bottom: 10px;
    a {
      font-weight: 600;
    }
  }
  .add-product-link {
    background-color: #b9d0ef;
    border: 2px solid #39577c;
    a {
      color: #39577c;
    }
  }
  .add-family-link {
    background-color: #65a2d8;
    border: 2px solid #39577c;
    a {
      color: white;
    }
  }
  .add-equip-link {
    background-color: #fff3d4;
    border: 2px solid #af8b61;
    a {
      color: #af8b61;
    }
  }
  .add-group-link {
    background-color: #ff9934;
    border: 2px solid #af8b61;
    a {
      color: white;
    }
  }
  .load-export-data {
    background-color: #d83232;
    border: 2px solid #af8b61;
    a {
      color: white;
    }
  }
}

#title-warning-modal___BV_modal_header_ {
  display: none;
}
#title-warning-modal___BV_modal_content_ {
  background-color: #cc0001;
  color: white;
}

#description-warning-modal___BV_modal_header_ {
  display: none;
}
#description-warning-modal___BV_modal_content_ {
  background-color: #cc0001;
  color: white;
}
</style>
