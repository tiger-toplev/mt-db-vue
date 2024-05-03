<template>
  <b-row>
    <b-col :cols="parseInt(labelCols)">
      <label class="mt-tree-label">{{ label }}</label>
    </b-col>
    <b-col class="mt-ts-input" :cols="parseInt(treeCols)">
      <tree-selector
        v-if="!hide_selection"
        :children="tree.children"
        :root="true"
        @selected="onSelected"
        :id_field="id_field"
        :parent_id_field="parent_id_field"
        :text_field="text_field"
        style="height: 10em; overflow: auto;"
      ></tree-selector>
      <input type="hidden" :value="value" />
    </b-col>
    <b-col :cols="parseInt(valueCols)">
      <b-input-group
        :prepend="$t('general.selected') + label"
        class="title-form"
      >
        <b-form-input readonly :value="display_value" />
        <b-input-group-append
          ><b-button variant="outline-dark" @click="onClear"
            ><b-icon-x /></b-button
        ></b-input-group-append>
      </b-input-group>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: "TreeSelectorInputRow",
  props: {
    label: { type: String },
    labelCols: { type: String, default: "2" },
    treeCols: { type: String, default: "4" },
    valueCols: { type: String },
    text_field: { type: String, default: "name_en" },
    id_field: { type: String, default: "id" },
    parent_id_field: { type: String, default: "parent_id" },
    value: [String, Number],
    root: { type: Boolean, default: true },
    list: { type: Array },

    display_ancestors: { type: Boolean, default: false },
    hide_selection: { type: Boolean, default: false }
  },
  data: function() {
    return {
      tree: null,
      value_copy: null
    };
  },
  created: function() {
    this.tree = {
      label: this.label,
      children: []
    };

    //Rebuild the category tree.
    let roots = this.list_to_tree(this.list);
    this.tree.children = roots;
    this.value_copy = this.value;
  },
  computed: {
    display_value: function() {
      if (typeof this.value_copy !== "undefined" && this.value_copy !== null) {
        let selection = this.list.find(v => {
          return v.id == this.value_copy;
        });
        if (selection) {
          let ancestors = [];
          let current_ancestor = selection;
          if (this.display_ancestors) {
            for (let i = 0; i < 100; i++) {
              //assume depth is less than 100
              current_ancestor = this.list.find(v => {
                return v.id == current_ancestor.parent_id;
              });
              if (!current_ancestor) {
                break;
              } else {
                ancestors.splice(0, 0, current_ancestor[this.text_field]);
              }
            }
          }
          let to_display = selection[this.text_field];
          if (ancestors.length > 0) {
            to_display += ` (${ancestors.join("/")})`;
          }
          return to_display;
        }
      }
      return "";
    }
  },
  methods: {
    list_to_tree(list) {
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
        if (node.parent_id) {
          // if you have dangling branches check that map[node.parent_id] exists
          list[map[node.parent_id]].children.push(node);
        } else {
          roots.push(node);
        }
      }
      return roots;
    },
    onClear: function() {
      //this.value_copy = null;
      this.$emit("input", null); //compatible for v-model
    },
    onSelected: function(payload) {
      // console.log(`Node ${payload.id} selected.`);
      this.value_copy = payload[this.id_field];
      this.$emit("input", payload[this.id_field]); //compatible for v-model
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.row {
  margin-bottom: 10px;
}
</style>
<style lang="scss">
.mt-ts-list {
  background: white !important;
}
.mt-ts-list-root {
  text-align: left !important;
  background: white !important;
  border: 2px solid #9bb6c4 !important;
  .mt-ts-list-item {
    background-color: white !important;
  }
}
.mt-tree-label {
  padding: 10px 20px;
  background-color: #ff9934;
  margin: 0px;
  color: white;
  border: 2px solid #af8b61;
  border-radius: 9px;
}
</style>
