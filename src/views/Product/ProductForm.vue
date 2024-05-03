<template>
  <div class="mt-1" v-cloak>
    <b-row no-gutters class="mb-2" align-v="center">
      <b-col class="p-2 product-id">
        <span v-cloak class="h5 pl-3" v-if="product && product.id"
          >{{ $t("product.editing") }}: ID = {{ product.id }}</span
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
          variant="outline-secondary"
          :href="browse_url"
          target="_blank"
          class="mr-3"
        >
          <b-icon-eye-fill />&nbsp;{{ $t("general.preview") }}
        </b-button>
        <b-button
          small
          variant="success"
          @click="saveAllProductData"
          :disabled="busy || is_sku_invalid"
        >
          <b-icon-cloud-upload />&nbsp;{{ $t("general.save") }}
        </b-button>
      </b-col>
    </b-row>

    <b-form v-if="product">
      <div class="section">
        <div class="toggle-icon" @click="toggleSection(1)">
          <b-icon-caret-up-fill v-if="!hide_section[1]" />&nbsp;
          <b-icon-caret-down-fill v-else />&nbsp;
        </div>
        <div v-if="hide_section[1]">
          <p class="strong">
            <template v-if="isAccessory || isPart"
              >{{ oem_brand_str }}: {{ product.oem }} / </template
            >{{ $t("product.sku") }}: {{ product.sku }}
          </p>
          {{ suppliers_str }} / {{ product_type_str }} {{ category_str }}
        </div>
        <template v-else>
          <b-form-row>
            <b-col cols="4">
              <b-form-group id="category_disabled" label-for="category">
                <b-input-group
                  class="category-form"
                  :prepend="$t('product.category')"
                >
                  <b-form-input
                    id="category"
                    disabled
                    v-model="category_str"
                    trim
                  ></b-form-input>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="1">
              <b-icon-pencil-square
                @click="openCategoryEditModal"
                class="custom-red edit-pencil"
              />
            </b-col>

            <b-col cols="2" v-if="isAccessory || isPart">
              <b-form-group id="brand_disabled" label-for="brand">
                <b-input-group
                  class="brand-form"
                  :prepend="$t('product.brand')"
                >
                  <b-form-input
                    id="brand"
                    disabled
                    v-model="oem_brand_str"
                    trim
                  ></b-form-input>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="1" v-if="isAccessory || isPart">
              <b-icon-pencil-square
                @click="openBrandEditModal"
                class="custom-red edit-pencil"
              />
            </b-col>

            <b-col cols="1" v-if="isAccessory || isPart">
              <b-form-group id="g_p_is_oem" label-for="p_is_oem">
                <b-form-checkbox
                  id="p_is_oem"
                  v-model="product.is_oem"
                  value="1"
                  unchecked-value="0"
                >
                  {{ $t("product.is_oem") }}
                </b-form-checkbox>
              </b-form-group>
            </b-col>
            <b-col cols="3" v-if="isAccessory || isPart">
              <b-form-group id="g_p_oem" label-for="p_oem">
                <b-input-group class="brand-form" :prepend="$t('product.oem')">
                  <b-form-input
                    id="p_oem"
                    v-model="product.oem"
                    trim
                  ></b-form-input>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-form-row>

          <b-form-row>
            <b-col cols="6">
              <b-form-group
                :label="$t('product.product_type')"
                class="horizontal-custom custom-light-pink"
                label-cols="4"
              >
                <b-form-select
                  id="p_product_type"
                  v-model="product.product_type_id"
                  :options="$store.state.product_types"
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
            <b-col cols="6">
              <b-form-group
                label="SKU"
                label-cols="2"
                class="horizontal-custom custom-blue"
              >
                <!-- <b-form-input id="p_sku" v-model="product.sku" trim v-on:keyup="validateSKU"></b-form-input> -->
                <!-- <vue-bootstrap-typeahead
                  id="p_sku"
                  v-model="product.sku"
                  :data="all_skus"
                  @hit="hitSKU"
                /> -->
                <vue-simple-suggest
                  id="p_sku"
                  v-model="product.sku"
                  :list="all_skus"
                  :filter-by-query="true"
                >
                </vue-simple-suggest>
                <div v-if="is_sku_invalid" class="alert alert-warning">
                  SKU you want to create already exists!
                </div>
              </b-form-group>
            </b-col>
          </b-form-row>

          <b-form-row v-for="(psupplier, idx) in product_suppliers" :key="idx">
            <b-col cols="5">
              <b-form-group
                :label="$t('product.supplier')"
                label-cols="4"
                class="horizontal-custom custom-green"
              >
                <b-form-select
                  v-model="psupplier.supplier_id"
                  :options="$store.state.suppliers"
                  value-field="id"
                  text-field="name_en"
                >
                  <template v-slot:first>
                    <b-form-select-option :value="null">{{
                      $t("general.choose")
                    }}</b-form-select-option>
                  </template>
                </b-form-select>
              </b-form-group>
            </b-col>

            <b-col cols="5">
              <b-form-group>
                <b-input-group
                  class="title-form"
                  :prepend="$t('product.price')"
                >
                  <b-form-input
                    v-model="psupplier.supplier_price"
                    type="text"
                    placeholder="supplier price"
                  ></b-form-input>
                </b-input-group>
              </b-form-group>
            </b-col>

            <b-col cols="2">
              <b-button
                @click="removeProductSupplier(idx)"
                variant="danger"
                size="md"
                >{{ $t("general.delete") }}</b-button
              >
            </b-col>
          </b-form-row>
          <b-button class="custom-btn" @click="newProductSupplier" size="sm">{{
            $t("product.add_supplier")
          }}</b-button>
        </template>
      </div>

      <div class="section">
        <div class="toggle-icon" @click="toggleSection(2)">
          <b-icon-caret-up-fill v-if="!hide_section[2]" />&nbsp;
          <b-icon-caret-down-fill v-else />&nbsp;
        </div>
        <div v-if="hide_section[2]">
          <p class="strong">{{ $t("product.filters") }}</p>
          ( {{ product_filter_options ? product_filter_options.length : 0 }} )
          {{ filters_str }}
          <!-- <span v-for="filter in filters" :key="filter.filter_id">
            {{filter.name_en}} : {{ getProductFilterOption(filter.filter_id).filter_option_id }} 
          </span> -->
        </div>
        <template v-else>
          <b-form v-if="product_filter_options">
            <b-form-row>
              <draggable
                v-model="filters"
                group="people"
                class="filters-div"
                @start="drag = true"
                @end="drag = false"
                @change="logFilter"
              >
                <!-- <div v-for="element in filters" :key="element.id">
                  {{ element.name_en }}
                </div> -->
                <b-col
                  cols="6"
                  v-for="filter in filters"
                  :key="filter.filter_id"
                >
                  <b-form-group
                    :label="filter.name_en"
                    label-cols="4"
                    class="horizontal-custom custom-blue"
                  >
                    <b-form-select
                      v-model="
                        getProductFilterOption(filter.filter_id)
                          .filter_option_id
                      "
                      :options="filter.options"
                      value-field="filter_option_id"
                      text-field="option_zh"
                      v-if="$store.state.lang === 'zh'"
                    >
                      <template v-slot:first>
                        <b-form-select-option :value="null"
                          >选择</b-form-select-option
                        >
                      </template>
                    </b-form-select>
                    <b-form-select
                      v-model="
                        getProductFilterOption(filter.filter_id)
                          .filter_option_id
                      "
                      :options="filter.options"
                      value-field="filter_option_id"
                      text-field="option_en"
                      v-else
                    >
                      <template v-slot:first>
                        <b-form-select-option :value="null">{{
                          $t("general.choose")
                        }}</b-form-select-option>
                      </template>
                    </b-form-select>
                  </b-form-group>
                </b-col>
              </draggable>
            </b-form-row>
          </b-form>
        </template>
      </div>

      <div class="section">
        <div class="toggle-icon" @click="toggleSection(3)">
          <b-icon-caret-up-fill v-if="!hide_section[3]" />&nbsp;
          <b-icon-caret-down-fill v-else />&nbsp;
        </div>
        <div v-if="hide_section[3]">
          <p class="strong">{{ $t("product.title") }}:</p>
          {{ product.name_en }} / {{ product.name_zh }}
          <br />
          <p class="mt-2">
            <strong>{{ $t("product.description") }}</strong
            >:
            <br />
            <span
              >{{ product.description_en }} / {{ product.description_zh }}
            </span>
          </p>
        </div>
        <template v-else>
          <b-form-row>
            <b-col>
              <b-form-group
                id="g_p_name_en"
                description=""
                label-for="p_name_en"
              >
                <b-input-group
                  class="title-form"
                  :prepend="$t('product.title') + ' (EN)'"
                >
                  <b-form-input
                    id="p_name_en"
                    v-model="product.name_en"
                    placeholder="derived by formula"
                    trim
                  ></b-form-input>
                  <b-button
                    class="custom-btn"
                    @click="handleCreateTitleClick('en')"
                    :disabled="!hasNameFormula"
                    >{{ $t("product.create_title") }}</b-button
                  >
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-form-row>

          <b-form-row>
            <b-col>
              <b-form-group
                id="g_p_name_zh"
                description=""
                label-for="p_name_zh"
              >
                <b-input-group
                  class="title-form"
                  :prepend="$t('product.title') + ' (ZH)'"
                >
                  <b-form-input
                    id="p_name_zh"
                    v-model="product.name_zh"
                    placeholder="derived by formula"
                    trim
                  ></b-form-input>
                  <b-button
                    class="custom-btn"
                    @click="handleCreateTitleClick('zh')"
                    :disabled="!hasNameFormula"
                    >{{ $t("product.create_title") }}</b-button
                  >
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-form-row>

          <b-form-row>
            <b-col cols="6">
              <b-form-group
                id="g_p_description_en"
                :label="$t('product.description') + ' (EN)'"
                label-for="p_description_en"
                class="custom-top-card custom-blue"
              >
                <b-form-textarea
                  id="p_description_en"
                  v-model="product.description_en"
                  rows="3"
                  max-rows="6"
                >
                </b-form-textarea>
              </b-form-group>
              <b-button
                class="custom-btn"
                @click="handleCreateDescriptionClick('en')"
                :disabled="!hasDescriptionFormula"
                small
                >{{ $t("product.create_description") }}</b-button
              >
            </b-col>
            <b-col cols="6">
              <b-form-group
                id="g_p_description_zh"
                :label="$t('product.description') + ' (ZH)'"
                label-for="p_description_zh"
                class="custom-top-card custom-blue"
              >
                <b-form-textarea
                  id="p_description_zh"
                  v-model="product.description_zh"
                  rows="3"
                  max-rows="6"
                ></b-form-textarea>
              </b-form-group>
              <b-button
                class="custom-btn"
                @click="handleCreateDescriptionClick('zh')"
                :disabled="!hasDescriptionFormula"
                small
                >{{ $t("product.create_description") }}</b-button
              >
            </b-col>
          </b-form-row>
        </template>
      </div>

      <div class="section product">
        <div class="toggle-icon" @click="toggleSection(4)">
          <b-icon-chevron-up v-if="!hide_section[4]" />&nbsp;
          <b-icon-chevron-down v-else />&nbsp;
        </div>
        <div v-if="hide_section[4]">
          <div class="images-section">
            <div cols="4">
              <p class="strong">
                {{ $t("product.product_images") }} ({{
                  product_images ? product_images.length : 0
                }})
              </p>
              <img
                v-if="product_images && product_images.length > 0"
                :src="product_images[0].image_link"
                style="max-width:50px"
              />
            </div>
            <div v-if="family">
              <p class="strong">{{ $t("family.family_image") }}</p>
              <img
                :src="family.image_link_connector_distal"
                style="max-height:50px"
              />
            </div>
            <div>
              <p class="strong">{{ $t("product.product_video") }}</p>
              <b-embed
                type="iframe"
                aspect="16by9"
                :src="product.video_link"
                style="height:50px; width: 90%"
                allowfullscreen
              ></b-embed>
            </div>
            <div v-if="family">
              <p class="strong">{{ $t("family.family_video") }}</p>
              <b-embed
                type="iframe"
                aspect="16by9"
                :src="family.video_link"
                style="height:50px; width: 90%"
                allowfullscreen
              ></b-embed>
            </div>
          </div>
        </div>
        <template v-else>
          <template v-if="product_images">
            <p class="strong">{{ $t("product.product_images") }}</p>
            <draggable
              v-model="product_images"
              group="people"
              class="product-images-div"
              @start="drag = true"
              @end="drag = false"
              @change="handleImageMove"
            >
              <b-form
                v-for="(pimage, idx) in product_images"
                :key="idx"
                class="image-form"
              >
                <b-form-row>
                  <b-col cols="8">
                    <b-form-group
                      :label="$t('product.image_type')"
                      label-cols="3"
                      class="horizontal-custom custom-blue"
                    >
                      <b-form-select
                        v-model="pimage.image_type_id"
                        :options="$store.state.image_types"
                        value-field="id"
                        text-field="name"
                      >
                        <template v-slot:first>
                          <b-form-select-option :value="null">{{
                            $t("general.choose")
                          }}</b-form-select-option>
                        </template>
                      </b-form-select>
                    </b-form-group>
                    <b-input-group
                      class="title-form"
                      :prepend="$t('product.link')"
                    >
                      <b-form-input
                        v-model="pimage.image_link"
                        type="text"
                        placeholder="url for the image"
                      ></b-form-input>
                    </b-input-group>
                  </b-col>

                  <b-col cols="2">
                    <b-img
                      :src="validateImage(pimage.image_link)"
                      width="120"
                      height="80"
                    />
                  </b-col>

                  <b-col cols="2">
                    <b-button
                      @click="removeProductImage(idx)"
                      variant="danger"
                      size="md"
                      >{{ $t("general.delete") }}</b-button
                    >
                  </b-col>
                </b-form-row>
              </b-form>
            </draggable>
          </template>

          <b-button class="custom-btn" @click="newProductImage" size="sm">{{
            $t("product.add_image")
          }}</b-button>
          <div>
            <p class="strong">{{ $t("product.product_video") }}</p>
          </div>
          <b-form-row>
            <b-col cols="8">
              <b-form-group>
                <b-input-group class="title-form" :prepend="$t('product.link')">
                  <b-form-input v-model="product.video_link" />
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="4">
              <b-embed
                type="iframe"
                aspect="16by9"
                :src="product.video_link"
                width="120"
                height="80"
                allowfullscreen
              ></b-embed>
            </b-col>
          </b-form-row>

          <div v-if="family">
            <p class="strong">{{ $t("family.family_image") }}</p>
            <b-form-row>
              <b-col>
                <b-form-group>
                  <b-input-group
                    class="title-form"
                    :prepend="$t('product.link')"
                  >
                    <b-form-input
                      v-model="family.image_link_connector_distal"
                    />
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col cols="4">
                <b-img
                  :src="validateImage(family.image_link_connector_distal)"
                  width="120"
                  height="80"
                  right
                />
              </b-col>
            </b-form-row>
          </div>

          <div v-if="family">
            <p class="strong">{{ $t("family.family_video") }}</p>
            <b-form-row>
              <b-col>
                <b-form-group>
                  <b-input-group
                    class="title-form"
                    :prepend="$t('product.link')"
                  >
                    <b-form-input v-model="family.video_link" />
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col cols="4">
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
          </div>
        </template>
      </div>

      <div class="section">
        <div class="toggle-icon" @click="toggleSection(5)">
          <b-icon-caret-up-fill v-if="!hide_section[5]" />&nbsp;
          <b-icon-caret-down-fill v-else />&nbsp;
        </div>
        <div v-if="hide_section[5]">
          <b-form-row>
            <b-col v-if="isAccessory || isPart" cols="4">
              <p class="strong">{{ $t("family.label") }}: {{ family_str }}</p>
            </b-col>
            <b-col v-if="isAccessory || isPart" cols="4">
              <p class="strong">{{ $t("group.label") }}: {{ group_str }}</p>
            </b-col>
            <b-col v-if="isAccessory" cols="4">
              <p class="strong">
                {{ $t("product.related_families") }} ({{
                  this.product && this.related_families
                    ? this.related_families.length
                    : 0
                }})
              </p>
            </b-col>
            <b-col v-if="isRepairService" cols="4">
              <p class="strong">{{ $t("product.related_equipments") }}</p>
              ({{
                this.product && this.related_equipments
                  ? this.related_equipments.length
                  : 0
              }})
            </b-col>
          </b-form-row>
        </div>
        <template v-else>
          <b-form-row v-if="isAccessory || isPart">
            <b-col cols="4">
              <b-form-group
                id="g_p_family"
                :label="$t('family.label')"
                label-cols="3"
                class="horizontal-custom custom-blue"
              >
                <v-select
                  v-model="product.family_id"
                  label="family_code"
                  :reduce="family => family.id"
                  :options="$store.state.families"
                ></v-select>
                <!-- <b-form-select
                  id="p_family"
                  v-model="product.family_id"
                  :options="$store.state.families"
                  value-field="id"
                  text-field="family_code"
                  :disabled="busy"
                >
                  <template v-slot:first>
                    <b-form-select-option value="">{{
                      $t("general.choose")
                    }}</b-form-select-option>
                  </template>
                </b-form-select> -->
              </b-form-group>
              <!-- <mt-family-search family_id="product.family_id"></mt-family-search> -->
            </b-col>
            <b-col cols="1">
              <b-link :href="'/family/' + product.family_id" target="_blank"
                ><b-icon-box-arrow-up-right
              /></b-link>
            </b-col>
            <b-col cols="4">
              <b-form-group
                id="g_p_group"
                :label="$t('group.group_code') + ':'"
                label-for="group_code"
                label-cols="6"
              >
                {{ group_str }}
                <b-link
                  v-if="family"
                  :href="'/group/' + family.group_id"
                  target="_blank"
                  ><b-icon-box-arrow-up-right
                /></b-link>
              </b-form-group>
            </b-col>
          </b-form-row>

          <b-form-row v-if="isAccessory">
            <b-col cols="6">
              <b-form-group
                id="g_p_related_families"
                :label="$t('product.related_families')"
                label-align="left"
                label-cols="4"
                class="horizontal-custom custom-blue related-families"
              >
                <!-- <b-form-select
                  id="p_related_families"
                  v-model="related_families"
                  :disabled="busy"
                  :options="$store.state.families"
                  text-field="family_code"
                  value-field="id"
                  :select-size="4"
                  multiple
                >
                  <template v-slot:first>
                    <b-form-select-option :value="null">{{
                      $t("general.multiple_choose")
                    }}</b-form-select-option>
                  </template>
                </b-form-select> -->
                <vue-single-select
                  v-model="selected_family"
                  :options="$store.state.families"
                  option-label="family_code"
                  :maxResults="-1"
                ></vue-single-select>
                <b-button
                  class="custom-btn"
                  @click="addRelatedFamily"
                  size="sm"
                  >{{ $t("general.add") }}</b-button
                >
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group
                v-if="family_connections"
                id="g_display_family_connections"
                :label="$t('product.currently_related_to')"
                label-for="display_family_connections"
                label-align="left"
                label-cols="4"
              >
                <p id="display_family_connections">{{ family_connections }}</p>
              </b-form-group>
            </b-col>
          </b-form-row>

          <b-form-row v-if="isRepairService">
            <b-col cols="6">
              <b-form-group
                id="g_p_related_equipments"
                label="Related Equipments"
                label-align="left"
                label-cols="4"
                class="horizontal-custom custom-blue related-families"
              >
                <!-- <b-form-select
                  id="p_related_equipments"
                  v-model="related_equipments"
                  :disabled="busy"
                  :select-size="4"
                  multiple
                >
                  <template v-slot:first>
                    <b-form-select-option :value="null">{{
                      $t("general.choose")
                    }}</b-form-select-option>
                  </template>
                  <b-form-select-option
                    v-for="eq in equipments"
                    :value="eq.id"
                    :key="eq.id"
                    >{{ eq.model }} / {{ eq.brand_en }}</b-form-select-option
                  >
                </b-form-select> -->
                <vue-single-select
                  v-model="selected_equipment"
                  :options="all_equipments"
                  option-label="text"
                  maxResults="-1"
                ></vue-single-select>
                <b-button
                  class="custom-btn"
                  @click="addRelatedEquipment"
                  size="sm"
                  >Add</b-button
                >
              </b-form-group>
            </b-col>
            <b-col cols="6">
              <b-form-group
                v-if="equipment_connections"
                id="g_display_equipment_connections"
                label="Currently Related to:"
                label-for="display_equipment_connections"
                label-align="left"
                label-cols="4"
              >
                <p id="display_equipment_connections">
                  {{ equipment_connections }}
                </p>
              </b-form-group>
            </b-col>
          </b-form-row>
        </template>
      </div>

      <div class="section">
        <div class="toggle-icon" @click="toggleSection(6)">
          <b-icon-caret-up-fill v-if="!hide_section[6]" />&nbsp;
          <b-icon-caret-down-fill v-else />&nbsp;
        </div>
        <div v-if="hide_section[6]">
          <b-form-row>
            <b-col cols="12">
              <template v-if="isAccessory"
                ><p class="strong">{{ $t("product.oem_reference") }}</p>
                ({{ product_oem_refs ? product_oem_refs.length : 0 }}):
                {{ oem_references_str }}</template
              >
              {{ $t("product.marketing_region") }}:
              {{ marketing_regions_str }}
            </b-col>
          </b-form-row>
        </div>
        <template v-else>
          <template v-if="isAccessory && product_oem_refs">
            <b-form
              v-for="(oemref, idx) in product_oem_refs"
              :key="oemref.brand_id"
            >
              <b-form-row>
                <b-col cols="4">
                  <b-form-group>
                    <b-input-group
                      class="title-form"
                      :prepend="$t('product.oem_reference')"
                    >
                      <b-form-input
                        v-model="oemref.name"
                        type="text"
                      ></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col cols="4">
                  <b-form-group
                    :label="$t('product.brand')"
                    label-cols="4"
                    class="horizontal-custom custom-blue"
                  >
                    <b-form-select
                      v-model="oemref.brand_id"
                      :options="$store.state.brands"
                      value-field="id"
                      text-field="name_en"
                    >
                      <template v-slot:first>
                        <b-form-select-option :value="null">{{
                          $t("general.choose")
                        }}</b-form-select-option>
                      </template>
                    </b-form-select>
                  </b-form-group>
                </b-col>
                <b-col cols="2">
                  <b-form-checkbox
                    v-model="oemref.is_oem"
                    value="1"
                    unchecked-value="0"
                  >
                    {{ $t("product.is_oem") }}:
                  </b-form-checkbox>
                </b-col>
                <b-col cols="2">
                  <b-button
                    @click="removeProductOemReference(idx)"
                    variant="danger"
                    size="sm"
                    >{{ $t("general.delete") }}</b-button
                  >
                </b-col>
              </b-form-row>
            </b-form>
            <b-button
              class="custom-btn"
              @click="newProductOemReference"
              size="sm"
              >{{ $t("product.add_oem_reference") }}</b-button
            >
          </template>

          <b-form v-if="product_marketing_regions">
            <b-form-row>
              <b-col>
                <b-form-group
                  id="g_p_marketing_regions"
                  :label="$t('product.marketing_region')"
                  label-for="p_marketing_regions"
                  label-align="left"
                  label-cols="2"
                >
                  <!-- <multiselect
                    id="p_marketing_regions"
                    v-model="product_marketing_regions"
                    placeholder="Search Marketing Regions"
                    label="name"
                    track-by="code"
                    :options="all_product_marketing_regions"
                    :multiple="true"
                  ></multiselect> -->
                  <b-form-checkbox-group
                    id="p_marketing_regions"
                    v-model="product_marketing_regions"
                    :options="all_product_marketing_regions"
                    value-field="id"
                    text-field="name"
                    :disabled="busy"
                  >
                  </b-form-checkbox-group>
                </b-form-group>
              </b-col>
            </b-form-row>
          </b-form>
        </template>
      </div>

      <div class="section">
        <div class="toggle-icon" @click="toggleSection(7)">
          <b-icon-caret-up-fill v-if="!hide_section[7]" />&nbsp;
          <b-icon-caret-down-fill v-else />&nbsp;
        </div>
        <div v-if="hide_section[7]">
          <b-form-row>
            <b-col cols="12">
              {{ $t("product.price") }}: &#36;{{ product.price_us }} /
              {{ product.price_zh }}&yen; / {{ product.price_eu }}&euro; /
              <template v-if="isAccessory || isPart"
                >{{ $t("product.unit") }}: {{ unit_str }} /</template
              ><template v-if="isAccessory"> {{ lifecycle_str }} /</template>
              {{ $t("product.warranty") }}:
              {{
                product.warranty_duration_months
                  ? product.warranty_duration_months
                  : 0
              }}
              {{ $t("product.months") }}
              <template v-if="isAccessory"
                >/ {{ $t("product.certificates") }} ({{
                  product_certificates.length
                }})</template
              >
              <template v-if="isAccessory || isPart"
                >/ {{ $t("product.weight") }}: {{ product.weight_kg }}kg ({{
                  product.weight_lbs
                }}
                lbs)</template
              >
            </b-col>
          </b-form-row>
        </div>
        <template v-else>
          <b-form-row>
            <b-col cols="4">
              <b-form-group
                id="g_p_price_us"
                label-for="p_price_us"
                label-align="right"
                class="price-form"
              >
                <b-input-group :prepend="$t('product.price') + ' ($)'">
                  <b-form-input
                    id="p_price_us"
                    v-model="product.price_us"
                    type="number"
                    :number="true"
                    min="0"
                    step="0.01"
                  >
                  </b-form-input>
                  <span class="price-manual">{{
                    $t("product.us_price_set")
                  }}</span>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="4">
              <b-form-group
                id="g_p_price"
                label-for="p_price_zh"
                label-align="right"
                class="price-form"
              >
                <b-input-group :prepend="$t('product.price') + ' (¥)'">
                  <b-form-input
                    id="p_price_zh"
                    v-model="product.price_zh"
                    type="number"
                    :number="true"
                    min="0"
                    step="0.01"
                  >
                  </b-form-input>
                  <b-button
                    class="custom-btn"
                    @click="calculateZHPrice()"
                    :disabled="!product.price_us"
                    small
                    >{{ $t("product.calc_price") }}</b-button
                  >
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="4">
              <b-form-group
                id="g_p_price_eu"
                label-for="p_price_eu"
                label-align="right"
                class="price-form"
              >
                <b-input-group :prepend="$t('product.category') + ' (€)'">
                  <b-form-input
                    id="p_price_eu"
                    v-model="product.price_eu"
                    type="number"
                    :number="true"
                    min="0"
                    step="0.01"
                  >
                  </b-form-input>
                  <b-button
                    class="custom-btn"
                    @click="calculateEUPrice()"
                    :disabled="!product.price_us"
                    small
                    >{{ $t("product.calc_price") }}</b-button
                  >
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row v-if="isAccessory || isPart">
            <b-col cols="4">
              <b-form-group
                id="g_p_unit"
                :label="$t('product.unit')"
                label-cols="4"
                class="horizontal-custom custom-blue"
              >
                <b-form-select
                  id="p_unit"
                  v-model="product.packaging_factor_id"
                  :options="$store.state.packaging_factors"
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
            <b-col cols="4">
              <b-form-group
                id="g_p_weight_kg"
                label-for="p_weight_kg"
                class="weight-form"
              >
                <b-input-group :prepend="$t('product.weight') + '(Kg)'">
                  <b-form-input
                    id="p_weight_kg"
                    v-model="product.weight_kg"
                    type="number"
                    :number="true"
                    min="0"
                    step="0.01"
                  >
                  </b-form-input>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="4">
              <b-form-group
                id="g_p_weight_lbs"
                label-for="p_weight_lbs"
                class="weight-form"
              >
                <b-input-group :prepend="$t('product.weight') + '(lbs)'">
                  <b-form-input
                    id="p_weight_lbs"
                    v-model="product.weight_lbs"
                    type="number"
                    :number="true"
                    min="0"
                    step="0.01"
                  >
                  </b-form-input>
                  <b-button
                    class="custom-btn"
                    @click="convertKilosToPound()"
                    :disabled="!product.weight_kg"
                    small
                    >{{ $t("product.convert_weight") }}</b-button
                  >
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row v-if="isAccessory">
            <b-col cols="6">
              <b-form-group
                id="g_p_lifecycle"
                :label="$t('product.lifecycle')"
                label-cols="3"
                class="horizontal-custom custom-blue"
              >
                <b-form-select
                  id="p_lifecycle"
                  v-model="product.lifecycle_id"
                  :options="$store.state.lifecycles"
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
            <b-col cols="6">
              <b-form-group
                id="g_p_certificates"
                :label="$t('product.certificates') + ':'"
                label-for="p_certificates"
                label-align="right"
                label-cols="3"
              >
                <b-form-checkbox-group
                  id="p_certficates"
                  v-model="product_certificates"
                  :options="$store.state.certificates"
                  value-field="id"
                  text-field="name_en"
                  :disabled="busy"
                  class="float-left"
                >
                </b-form-checkbox-group>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col cols="6">
              <b-form-group
                id="g_p_warranty"
                label-for="p_warranty"
                label-align="right"
              >
                <b-input-group
                  :prepend="$t('product.warranty')"
                  class="title-form"
                >
                  <b-form-input
                    id="p_warranty"
                    v-model="product.warranty_duration_months"
                    type="number"
                    min="0"
                    max="120"
                    step="1"
                  >
                  </b-form-input>
                  <b-input-group-append>
                    <span>{{ $t("product.months") }}</span>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-form-row>
        </template>
      </div>

      <div class="section">
        <div class="toggle-icon" @click="toggleSection(8)">
          <b-icon-caret-up-fill v-if="!hide_section[8]" />&nbsp;
          <b-icon-caret-down-fill v-else />&nbsp;
        </div>
        <div v-if="hide_section[8]">
          <b-form-row>
            <b-col cols="12">
              {{ $t("product.internal_notes") }}: ({{
                product.notes_internal ? "Y" : "N"
              }}) {{ $t("product.public_notes") }}: ({{
                product.notes_client ? "Y" : "N"
              }}) {{ $t("product.tags") }} (1): {{ tags_str }}
              {{ $t("product.custom_attributes") }} ({{
                custom_attributes.length
              }}):
              {{ attributes_str }}
            </b-col>
          </b-form-row>
        </div>
        <template v-else>
          <b-form-row>
            <b-col cols="6">
              <b-form-group
                id="internal-notes-text"
                :label="$t('product.internal_notes')"
                label-for="internal-notes"
                label-align="left"
                class="custom-top-card custom-red"
              >
                <b-form-textarea
                  id="internal-notes"
                  v-model="product.notes_internal"
                  rows="3"
                  max-rows="6"
                ></b-form-textarea>
              </b-form-group>
            </b-col>

            <b-col cols="6">
              <b-form-group
                id="public-notes-text"
                :label="$t('product.public_notes')"
                label-for="public-notes"
                label-align="left"
                class="custom-top-card custom-blue"
              >
                <b-form-textarea
                  id="public-notes"
                  v-model="product.notes_client"
                  rows="3"
                  max-rows="6"
                ></b-form-textarea>
              </b-form-group>
            </b-col>
          </b-form-row>

          <b-form-row>
            <b-col cols="12">
              <b-form-group
                id="g_p_tags"
                :label="$t('product.tags')"
                label-for="p_tags"
                label-align="left"
                label-cols="1"
                class="custom-product-tags"
              >
                <b-form-tags
                  id="p_tags"
                  v-model="product_tags"
                  separator=","
                ></b-form-tags>
              </b-form-group>
            </b-col>
          </b-form-row>

          <template v-if="product_custom_attributes">
            <p class="strong">{{ $t("product.custom_attributes") }}</p>
            <b-form-row v-for="(attr, idx) in custom_attributes" :key="idx">
              <b-col cols="6">
                <b-form-group class="custom-product-tags">
                  <b-input-group
                    class="custom-attribute-form"
                    :prepend="attr.name_en + ' (EN):'"
                  >
                    <b-form-input
                      v-model="getProductCustomAttribute(attr.id).value_en"
                      type="text"
                    >
                    </b-form-input>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col cols="6">
                <b-form-group>
                  <b-input-group
                    class="custom-attribute-form"
                    :prepend="attr.name_zh + ' (ZH):'"
                  >
                    <b-form-input
                      v-model="getProductCustomAttribute(attr.id).value_zh"
                      type="text"
                    >
                    </b-form-input>
                  </b-input-group>
                </b-form-group>
              </b-col>
            </b-form-row>
          </template>
        </template>
      </div>

      <div class="section" v-if="isPart">
        <div class="toggle-icon" @click="toggleSection(9)">
          <b-icon-caret-up-fill v-if="!hide_section[9]" />&nbsp;
          <b-icon-caret-down-fill v-else />&nbsp;
        </div>
        <div v-if="hide_section[9]">
          <b-form-row>
            <b-col cols="12">
              {{ $t("product.child_products") }} ({{ product_sets.length }}):
              {{ child_products_str }}
            </b-col>
          </b-form-row>
        </div>
        <template v-else>
          <template v-if="product_sets">
            <b-form v-for="(pset, idx) in product_sets" :key="idx">
              <b-form-row>
                <b-col cols="4">
                  <b-form-group label="Child product:" label-cols="4">
                    <b-form-select
                      v-model="pset.child_product_id"
                      :options="products"
                      value-field="id"
                      text-field="sku"
                    >
                      <template v-slot:first>
                        <b-form-select-option :value="null">{{
                          $t("general.choose")
                        }}</b-form-select-option>
                      </template>
                    </b-form-select>
                  </b-form-group>
                </b-col>

                <b-col cols="4">
                  <b-form-group
                    label="Child count:"
                    label-align="right"
                    label-cols="4"
                  >
                    <b-form-input
                      type="number"
                      min="0"
                      step="1"
                      v-model="pset.quantity"
                    ></b-form-input>
                  </b-form-group>
                </b-col>

                <b-col cols="4">
                  <b-button
                    @click="removeProductSet(idx)"
                    variant="outline-danger"
                    size="sm"
                    >{{ $t("general.delete") }}</b-button
                  >
                </b-col>
              </b-form-row>
            </b-form>
          </template>
          <b-button class="custom-btn" @click="newProductSet" size="sm">{{
            $t("product.add_child_product")
          }}</b-button>
        </template>
      </div>
      <!-- <b-form-row>
        <b-col>
          <b-form-group
            id="g_p_supplier"
            label="Supplier:"
            label-for="p_supplier"
            label-cols="2"
          >
            <b-form-select
              id="p_supplier"
              v-model="product.supplier_id"
              :options="$store.state.suppliers"
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
      </b-form-row> -->

      <b-button
        v-if="product"
        class="mt-2"
        variant="danger"
        v-b-modal.modal-1
        >{{ $t("product.delete") }}</b-button
      >

      <b-modal id="modal-1" title="Alert" @ok="handleDeleteProduct">
        <p class="my-2">{{ $t("product.delete_description") }}</p>
      </b-modal>

      <b-modal id="category-edit-modal" size="lg" hide-footer>
        <template v-slot:modal-title>
          {{ $t("product.category") }} {{ $t("general.editor") }}
        </template>
        <div class="d-block text-center">
          <!-- v-if="show_cateogry_warning" -->
          <!-- <div class="alert alert-warning">
            If you change the category, the category related data will be
            deleted
          </div> -->
          <tree-selector-input-row
            :list="sibling_categories"
            :key="edit_category_id"
            v-model="edit_category_id"
            :label="$t('product.category')"
            label-cols="3"
            tree-cols="9"
            class="mt-10"
            display_ancestors
          ></tree-selector-input-row>
        </div>
        <div class="control-btn-groups">
          <b-button
            class="mt-3 custom-btn mr-3"
            @click="confirmSaveCategoryId"
            >{{ $t("general.save") }}</b-button
          >
          <b-button class="mt-3 custom-btn" @click="cancelSaveCategoryId">{{
            $t("general.close")
          }}</b-button>
        </div>
      </b-modal>

      <b-modal id="brand-edit-modal" hide-footer>
        <template v-slot:modal-title>
          {{ $t("product.brand") }} {{ $t("general.editor") }}
        </template>
        <div class="d-block text-center">
          <tree-selector-input-row
            v-if="isAccessory || isPart"
            :list="$store.state.brands"
            :key="edit_brand_id"
            v-model="edit_brand_id"
            :label="$t('product.brand')"
            label-cols="4"
            tree-cols="8"
            display_ancestors
            class="mt-10"
          ></tree-selector-input-row>
        </div>
        <div class="control-btn-groups">
          <b-button
            class="mt-3 custom-btn mr-3"
            variant="primary"
            @click="confirmSaveBrandId"
            >{{ $t("general.save") }}</b-button
          >
          <b-button class="mt-3 custom-btn" @click="cancelSaveBrandId">{{
            $t("general.close")
          }}</b-button>
        </div>
      </b-modal>

      <b-modal id="title-warning-modal" size="lg" hide-footer>
        <h3 class="text-center">{{ $t("general.warning") }}!!!</h3>
        <div class="d-block text-center">
          {{ $t("product.title_change_message") }}
        </div>
        <p class="mt-3 text-center">{{ $t("product.delete_final") }}</p>
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

      <b-modal id="description-warning-modal" size="lg" hide-footer>
        <h3 class="text-center">{{ $t("general.warning") }}!!!</h3>
        <div class="d-block text-center">
          {{ $t("product.description_change_message") }}
        </div>
        <p class="mt-3 text-center">{{ $t("product.delete_final") }}</p>
        <div class="control-btn-groups">
          <b-button
            class="mt-3 mr-3 custom-white-btn"
            @click="generateDescription(button_locale)"
            >{{ $t("product.ok_create_description") }}</b-button
          >
          <b-button
            class="mt-3 custom-white-btn"
            @click="$bvModal.hide('description-warning-modal')"
            >{{ $t("general.cancel") }}</b-button
          >
        </div>
      </b-modal>
    </b-form>
  </div>
</template>

<script>
import Vue from "vue";
import { mapActions } from "vuex";
import { ApiError } from "@/Api.js";
import draggable from "vuedraggable";
//import Multiselect from "vue-multiselect";

export default {
  name: "ProductForm",
  data() {
    return {
      message: null,
      error: null,
      in_process: 0,
      tab_active: null,

      custom_attributes: [],
      equipments: [], //for selecting models
      family: null, //actually a family-view
      filters: [], //options will also be loaded
      product: null, //actually a product-view
      product_certificates: [],
      product_custom_attributes: null,
      product_filter_options: null,
      product_images: null,
      product_suppliers: null,
      product_marketing_regions: null,
      all_product_marketing_regions: [
        { name: "USA", code: "us", id: 1 },
        { name: "EU", code: "eu", id: 2 },
        { name: "China", code: "zh", id: 3 }
      ],
      product_oem_refs: null,
      product_sets: null,
      product_tags: [],
      products: [], //for sets
      related_equipments: [], //equipment ids only
      related_families: [], //family ids only
      selected_family: null,
      selected_equipment: null,
      all_skus: [],
      is_sku_invalid: false,
      original_product_sku: null,
      all_products: [],
      show_cateogry_warning: false,
      hide_section: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true
      ],
      edit_category_id: -1,
      edit_brand_id: -1,
      button_locale: "en",
      sibling_ids: []
    };
  },
  components: {
    draggable
    //Multiselect
  },
  //props: {},
  computed: {
    browse_url: function() {
      return "/product/view/" + this.$route.params.id;
    },
    busy: function() {
      return this.in_process > 0;
    },
    category: function() {
      return this.$store.state.categories.find(c => {
        return c.id == this.product.category_id;
      });
    },
    equipment_connections: function() {
      if (!this.related_equipments) return "";
      return this.related_equipments
        .filter(eqid => {
          return eqid != "";
        })
        .map(eqid => {
          let eq = this.equipments.find(e => {
            return e.id === eqid;
          });
          if (eq) return eq.model;
        })
        .join(",");
    },
    family_connections: function() {
      if (!this.related_families) return "";
      return this.related_families
        .filter(fid => {
          return fid != "";
        })
        .map(fid => {
          let f = this.$store.state.families.find(v => {
            return v.id === fid;
          });
          if (f) return f.family_code;
        })
        .join(",");
    },

    /**
     * The highest-level ancestor of the current category.
     */
    general_category: function() {
      return this.topAncestorCategoryFor(this.product.category_id);
    },
    sibling_categories: function() {
      return this.$store.state.categories.filter(item => {
        if (this.sibling_ids.includes(item.id)) return true;
      });
    },
    hasError: function() {
      return this.error ? true : false;
    },
    hasMessage: function() {
      return this.message ? true : false;
    },
    hasNameFormula: function() {
      return this.category && this.category.product_name_formula;
    },
    hasDescriptionFormula: function() {
      return this.category && this.category.product_description_formula;
    },
    isPart: function() {
      return this.general_category.id == 2;
    },
    isAccessory: function() {
      return this.general_category.id == 1;
    },
    isRepairService: function() {
      return this.general_category.id == 3;
    },
    oem_brand_str: function() {
      let brand = this.$store.state.brands.find(
        item => item.id == this.product.oem_brand_id
      );
      return brand ? brand.name_en : "";
    },
    category_str: function() {
      let category = this.$store.state.categories.find(
        item => item.id == this.product.category_id
      );
      return category ? category.name_en : "";
    },
    suppliers_str: function() {
      if (this.product_suppliers && this.product_suppliers.length) {
        let item = this.$store.state.suppliers.find(
          item => item.id == this.product_suppliers[0].supplier_id
        );
        if (item) {
          if (this.product_suppliers.length > 1)
            return (
              "(" +
              item.name_en +
              " + " +
              (this.product_suppliers.length - 1) +
              ")"
            );
          return "(" + item.name_en + ")";
        }
        return "";
      }
      return "";
    },
    product_type_str: function() {
      let product_type = this.$store.state.product_types.find(
        item => item.id == this.product.product_type_id
      );
      return product_type ? product_type.name_en : "";
    },
    filters_str: function() {
      if (!this.product_filter_options) return "";
      let str = "";
      this.filters.map(filter => {
        console.log(
          "filter",
          filter,
          this.getProductFilterOption(filter.filter_id).filter_option_id
        );
        let selected_option = filter.options.find(
          option =>
            option.filter_option_id ==
            this.getProductFilterOption(filter.filter_id).filter_option_id
        );
        console.log("selected_option", selected_option);
        if (selected_option)
          str += filter.name_en + " : " + selected_option.option_en + " ";
      });
      return str;
    },
    family_str: function() {
      let family = this.$store.state.families.find(
        item => item.id == this.product.family_id
      );
      return family ? family.family_code : "";
    },
    group_str: function() {
      let family = this.$store.state.families.find(
        item => item.id == this.product.family_id
      );
      return family ? family.group_code : "";
    },
    oem_references_str: function() {
      if (!this.product_oem_refs || this.product_oem_refs.length == 0)
        return "";
      let str = "";
      this.product_oem_refs.map(item => {
        str += item.name + " / ";
      });
      return str;
    },
    marketing_regions_str: function() {
      if (!this.product_marketing_regions) return "";
      let str = "";

      this.product_marketing_regions.map((region_id, index) => {
        if (index > 0) str += "/";
        str += this.all_product_marketing_regions.find(
          region => region.id == region_id
        ).name;
      });
      return str;
    },
    tags_str: function() {
      return this.product_tags.join(" ");
    },
    attributes_str: function() {
      return "";
    },
    all_family_codes: function() {
      return this.$store.state.families.map(family => family.family_code);
    },
    all_equipments: function() {
      console.log(
        this.equipments.length,
        this.equipments.map(equipment => {
          return {
            id: equipment.id,
            text: equipment.model + " / " + equipment.brand_en
          };
        }).length
      );
      return this.equipments.map(equipment => {
        return {
          id: equipment.id,
          text: equipment.model + " / " + equipment.brand_en
        };
      });
    },
    unit_str: function() {
      let family = this.$store.state.packaging_factors.find(
        item => item.id == this.product.packaging_factor_id
      );
      return family ? family.name : "";
    },
    lifecycle_str: function() {
      let lifecycle = this.$store.state.lifecycles.find(
        item => item.id == this.product.lifecycle_id
      );
      return lifecycle ? lifecycle.name_en : "";
    },
    child_products_str: function() {
      let str = "";
      this.product_sets.map((pset, index) => {
        let child_product = this.products.find(
          item => item.id == pset.child_product_id
        );
        if (index > 0) str += " / ";
        str += " " + child_product.sku + " X " + pset.quantity;
      });
      return str;
    },
    first_image: function() {
      return '<img src="' + this.product_images[0].image_link + '"/>';
    }
    // valid_units: function(){
    //   let units = [1, 5, 6, 10, 12, 16, 20, 24, 25, 50, 100];
    //   let ancestor = this.general_category;
    //   if(ancestor && ancestor.name_en==='Parts'){
    //     units.push("Set");
    //   }
    //   return units;
    // }
  },
  watch: {
    async $route() {
      this.initializeProductData();
      await this.loadData();
    },
    "product.category_id": {
      handler: function(new_val, old_val) {
        if (old_val != undefined) {
          this.show_cateogry_warning = true;
        }
      }
    },
    "product.sku": {
      handler: function() {
        if (this.product.sku === this.original_product_sku)
          return (this.is_sku_invalid = false);
        this.is_sku_invalid = this.all_skus.includes(this.product.sku)
          ? true
          : false;
      }
    }
    // product_marketing_regions: {
    //   handler: function() {
    //     console.log(this.product_marketing_regions);
    //   }
    // }
  },
  created: async function() {
    this.$store.state.selectedMenu = "product";
    if (this.$route.params.id) {
      await this.loadData();
    } else {
      this.error = "No product specified.";
    }
    this.all_skus = await Vue.mtapi.getProductSkus();
    console.log("$store.state.categories", this.$store.state.categories);
    console.log("general_category", this.general_category);

    this.sibling_ids = [];
    this.getChildren(this.general_category);
    //let result = await Vue.mtapi.getProducts("");
    //this.all_products = result.product_views;
  },
  methods: {
    ...mapActions(["deleteProduct"]),
    initializeProductData() {
      this.custom_attributes = [];
      this.equipments = [];
      this.family = null;
      this.filters = [];
      this.product = null;
      this.product_certificates = [];
      this.product_custom_attributes = null;
      this.product_filter_options = null;
      this.product_images = null;
      this.product_suppliers = null;
      this.product_marketing_regions = null;
      this.product_oem_refs = null;
      this.product_sets = null;
      this.product_tags = [];
      this.products = [];
      this.related_families = [];
      this.related_equipments = [];
    },
    getProductCustomAttribute: function(attr_id) {
      let the_pca = this.product_custom_attributes.find(pca => {
        return pca.custom_attribute_id == attr_id;
      });
      if (!the_pca) {
        //lazy init.
        the_pca = {
          product_id: this.product.id,
          custom_attribute_id: attr_id,
          name_en: null,
          name_zh: null
        };
        this.product_custom_attributes.push(the_pca);
      }
      return the_pca;
    },
    getProductFilterOption: function(filter_id) {
      let the_pfo = this.product_filter_options.find(pfo => {
        return pfo.filter_id == filter_id;
      });
      if (!the_pfo) {
        //lazy init.
        the_pfo = {
          product_id: this.product.id,
          filter_id: filter_id,
          filter_option_id: null
        };
        this.product_filter_options.push(the_pfo);
      }
      return the_pfo;
    },
    handleCreateTitleClick(locale) {
      this.button_locale = locale;
      if (locale == "en" && this.product.name_en) {
        this.$bvModal.show("title-warning-modal");
      } else if (locale == "zh" && this.product.name_zh) {
        this.$bvModal.show("title-warning-modal");
      } else {
        this.generateName(locale);
      }
    },
    generateName(locale) {
      this.$bvModal.hide("title-warning-modal");
      if (this.category.product_name_formula) {
        try {
          let generator = {
            generate: eval(this.category.product_name_formula)
          };
          let context = {
            family: this.family,
            product: this.product,
            filter_options: this.product_filter_options
          };
          this.normalizeEmptyVals(context.family);
          this.normalizeEmptyVals(context.product);
          context.filter_options.forEach(fo => {
            this.normalizeEmptyVals(fo);
          });
          if (locale === "en") {
            let result = generator.generate(context, "en");
            this.product.name_en = result.replace(/null|undefined/gi, "");
          } else {
            let result = generator.generate(context, "zh");
            this.product.name_zh = result.replace(/null|undefined/gi, "");
          }
        } catch (ex) {
          console.error(ex);
        }
      }
    },
    handleCreateDescriptionClick(locale) {
      this.button_locale = locale;
      if (locale == "en" && this.product.description_en) {
        this.$bvModal.show("description-warning-modal");
      } else if (locale == "zh" && this.product.description_zh) {
        this.$bvModal.show("description-warning-modal");
      } else {
        this.generateDescription(locale);
      }
    },
    generateDescription(locale) {
      this.$bvModal.hide("description-warning-modal");
      if (this.category.product_description_formula) {
        try {
          let generator = {
            generate: eval(this.category.product_description_formula)
          };
          let context = {
            family: this.family,
            product: this.product,
            filter_options: this.product_filter_options
          };
          this.normalizeEmptyVals(context.family);
          this.normalizeEmptyVals(context.product);
          context.filter_options.forEach(fo => {
            this.normalizeEmptyVals(fo);
          });
          if (locale === "en") {
            let result = generator.generate(context, "en");
            this.product.description_en = result.replace(
              /null|undefined/gi,
              ""
            );
          } else {
            let result = generator.generate(context, "zh");
            this.product.description_zh = result.replace(
              /null|undefined/gi,
              ""
            );
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
    },
    loadCustomAttributesForCategory: async function() {
      try {
        this.in_process++;
        this.custom_attributes = await Vue.mtapi.getCustomAttributesForCategory(
          this.product.category_id
        );
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load custom attributes for the category.";
      } finally {
        this.in_process--;
      }
    },
    loadData: async function() {
      try {
        this.message = "Loading...";
        this.error = null;

        await this.loadProduct();

        this.message = "Loading product dependencies...";
        await Promise.all([
          this.loadCustomAttributesForCategory(),
          this.loadEquipment(),
          this.loadProductEquipment(),
          this.loadProductCertificates(),
          this.loadProductFamilies(),
          this.loadFilterOptionViewsForCategory(),
          this.loadProductFilterOptions(),
          this.loadFamily(),
          this.loadProductMarketingRegions(),
          this.loadProductSuppliers(),
          this.loadProductImages(),
          this.loadProductOemReferences(),
          this.loadProductCustomAttributes(),
          this.loadProductSets()
        ]);

        //If master data is missing, emit a reload request from the master app.
        if (
          this.$store.state.categories.length === 0 ||
          !this.$store.state.certificates.length === 0 ||
          !this.$store.state.lifecycles.length === 0 ||
          !this.$store.state.product_types.length === 0
        ) {
          this.$emit("reload");
        }
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't load product data. ${err.message}`;
        } else {
          this.error = `Couldn't load product data.`;
          console.error(err);
        }
      }
    },
    loadEquipment: async function() {
      try {
        this.in_process++;
        this.message = "Loading equipment...";
        let apiresp = await Vue.mtapi.getEquipmentList();
        this.equipments = apiresp.equipment_views;
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load equipment.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadFamily: async function() {
      try {
        if (!this.product || !this.product.family_id) return;
        if (this.family && this.family.id == this.product.family_id) return;
        this.in_process++;
        this.message = "Loading...";
        this.family = await Vue.mtapi.getFamily(this.product.family_id);
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load family.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    saveFamily: async function() {
      this.in_process++;
      this.message = "Saving family...";
      try {
        this.family = await Vue.mtapi.saveFamily(this.family);
      } catch (ex) {
        this.message = "Error saving family.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    loadFilterOptionViewsForCategory: async function() {
      try {
        this.in_process++;
        this.message = "Loading filter options...";
        this.filters = [];
        let filter_option_views = await Vue.mtapi.getFilterOptionViewsForCategory(
          this.product.category_id
        );
        filter_option_views.forEach(fov => {
          let filter = this.filters.find(f => {
            return f.filter_id == fov.filter_id;
          });
          if (!filter) {
            filter = {
              filter_id: fov.filter_id,
              name_en: fov.filter_en,
              name_zh: fov.filter_zh,
              options: []
            };
            this.filters.push(filter);
          }
          filter.options.push({
            filter_option_id: fov.filter_option_id,
            option_en: fov.option_en,
            option_zh: fov.option_zh
          });
        });
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load filter options.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProduct: async function() {
      try {
        this.in_process++;
        this.message = "Loading...";
        this.product = await Vue.mtapi.getProduct(this.$route.params.id);
        this.original_product_sku = this.product.sku;
        this.product_tags = this.product.tags
          ? this.product.tags.split(",")
          : [];
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load product.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProducts: async function() {
      try {
        this.in_process++;
        this.message = "Loading...";
        let apiresp = await Vue.mtapi.getProducts({
          order_by: "+sku",
          limit: 1000
        });
        this.products = apiresp.product_views;
        this.products = this.products.filter(p => {
          return p.sku ? true : false;
        });
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load products.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProductCertificates: async function() {
      try {
        this.in_process++;
        let tempcerts = await Vue.mtapi.getProductCertificates(this.product.id);
        this.product_certificates = tempcerts.map(v => {
          return v.certificate_id;
        }); //just the cert ids.
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load product certificates.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProductCustomAttributes: async function() {
      console.log("load custom atributes");
      if (this.product_custom_attributes !== null) return; //Otherwise server overwrites work
      try {
        this.tab_active = "Custom Attributes";
        this.error = null;
        this.message = "Loading custom attributes...";
        this.in_process++;
        this.product_custom_attributes = await Vue.mtapi.getProductCustomAttributes(
          this.$route.params.id
        );
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get product custom attributes. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.message = null;
        this.in_process--;
      }
    },
    loadProductEquipment: async function() {
      try {
        this.in_process++;
        this.message = "Loading models...";
        let temp = await Vue.mtapi.getProductEquipment(this.product.id);
        this.related_equipments = temp.map(v => {
          return v.equipment_id;
        }); //just the equipment ids.
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load models.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProductFamilies: async function() {
      try {
        this.in_process++;
        this.message = "Loading families...";
        let tempfamilyconns = await Vue.mtapi.getProductFamilies(
          this.product.id
        );
        this.related_families = tempfamilyconns.map(v => {
          return v.family_id;
        }); //just the family ids.
      } catch (ex) {
        console.error(ex);
        this.error = "Couldn't load product families.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },

    loadProductFilterOptions: async function() {
      try {
        this.error = null;
        this.message = "Loading filter options...";
        this.in_process++;
        this.product_filter_options = await Vue.mtapi.getProductFilterOptions(
          this.$route.params.id
        );
        console.log("this.product_filter_options", this.product_filter_options);
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get product filter options. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProductSuppliers: async function() {
      if (this.product_suppliers !== null) return; //Otherwise server overwrites work
      try {
        this.error = null;
        this.message = "Loading suppliers...";
        this.in_process++;
        this.product_suppliers = await Vue.mtapi.getProductSuppliers(
          this.$route.params.id
        );
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get product suppliers. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.message = "";
        this.in_process--;
      }
    },
    loadProductImages: async function() {
      if (this.product_images !== null) return; //Otherwise server overwrites work
      try {
        this.tab_active = "Images";
        this.error = null;
        this.message = "Loading images...";
        this.in_process++;
        this.product_images = await Vue.mtapi.getProductImages(
          this.$route.params.id
        );
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get product images. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.message = "";
        this.in_process--;
      }
    },
    loadProductMarketingRegions: async function() {
      if (this.product_marketing_regions !== null) return; //Otherwise server overwrites work
      try {
        this.error = null;
        this.message = "Loading marketing regions...";
        this.in_process++;
        const res = await Vue.mtapi.getProductMarketingRegions(
          this.$route.params.id
        );

        this.product_marketing_regions = res.map(
          item => item.marketing_region_id
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
    loadProductOemReferences: async function() {
      if (this.product_oem_refs !== null) return; //Otherwise server overwrites work
      try {
        this.tab_active = "OEM References";
        this.error = null;
        this.message = "Loading OEMs...";
        this.in_process++;
        this.product_oem_refs = await Vue.mtapi.getProductOemReferences(
          this.$route.params.id
        );
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get product OEMs. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.in_process--;
        this.message = "";
      }
    },
    loadProductSets: async function() {
      if (this.product_sets !== null) return; //Otherwise server overwrites work
      try {
        this.tab_active = "Set";
        this.error = null;
        this.message = "Loading set...";
        this.in_process++;
        this.product_sets = await Vue.mtapi.getProductSets(
          this.$route.params.id
        );
        await this.loadProducts();
      } catch (err) {
        if (err instanceof ApiError) {
          this.error = `Couldn't get product set. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.message = "";
        this.in_process--;
      }
    },

    tabProductFilters: async function() {
      this.tab_active = "Filters";
    },
    newProductFilterOption: function() {
      this.product_filter_options.push({
        id: null,
        product_id: this.product.id,
        filter_option_id: null,
        image_link: null
      });
    },
    newProductSupplier: function() {
      this.product_suppliers.push({
        product_id: this.product.id,
        supplier_id: null,
        supplier_price: null
      });
    },
    newProductImage: function() {
      this.product_images.push({
        product_id: this.product.id,
        image_type_id: null,
        image_link: null,
        priority_order: this.product_images.length
      });
    },
    newProductOemReference: function() {
      this.product_oem_refs.push({
        id: null,
        product_id: this.product.id,
        brand_id: null,
        name: ""
      });
    },
    newProductSet: function() {
      this.product_sets.push({
        parent_product_id: this.product.id,
        child_product_id: null,
        quantity: null
      });
    },
    removeProductFilterOption: function(idx) {
      if (idx >= 0) this.product_filter_options.splice(idx, 1);
    },
    removeProductSupplier: function(idx) {
      if (idx >= 0) this.product_suppliers.splice(idx, 1);
    },
    removeProductImage: function(idx) {
      if (idx >= 0) this.product_images.splice(idx, 1);
    },
    removeProductOemReference: function(idx) {
      if (idx >= 0) this.product_oem_refs.splice(idx, 1);
    },
    removeProductSet: function(idx) {
      if (idx >= 0) this.product_sets.splice(idx, 1);
    },
    saveAllProductData: async function() {
      try {
        await this.saveProduct();

        await Promise.all([
          this.saveProductFamilies(),
          this.saveProductEquipment(),
          this.saveProductCertificates(),
          this.saveProductImages(),
          this.saveProductOemReferences(),
          this.saveProductFilterOptions(),
          this.saveProductCustomAttributes(),
          this.saveProductSets(),
          this.saveProductSuppliers(),
          this.saveProductMarketingRegions(),
          this.saveFamily()
        ]);
      } catch (ex) {
        this.message = "Error saving product.";
        this.error = ex.message;
      }
    },
    saveProduct: async function() {
      this.in_process++;
      this.message = "Saving product...";
      try {
        this.product.tags =
          this.product_tags && this.product_tags.length > 0
            ? this.product_tags.join(",")
            : "";
        this.product = await Vue.mtapi.saveProduct(this.product);
        this.original_product_sku = this.product.sku;
      } catch (ex) {
        this.message = "Error saving product.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductCertificates: async function() {
      this.in_process++;
      this.message = "Saving certificates...";
      try {
        await Vue.mtapi.saveProductCertificates(
          this.product.id,
          this.product_certificates
        );
      } catch (ex) {
        this.message = "Error saving certificates.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductEquipment: async function() {
      this.in_process++;
      this.message = "Saving related models...";
      try {
        await Vue.mtapi.saveProductEquipment(
          this.product.id,
          this.related_equipments
        );
      } catch (ex) {
        this.message = "Error saving related models.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductFamilies: async function() {
      this.in_process++;
      this.message = "Saving related families...";
      try {
        await Vue.mtapi.saveProductFamilies(
          this.product.id,
          this.related_families
        );
      } catch (ex) {
        this.message = "Error saving related families.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductFilterOptions: async function() {
      if (this.product_filter_options === null) return;
      this.in_process++;
      this.message = "Saving OEM references...";
      try {
        await Vue.mtapi.saveProductFilterOptions(
          this.product.id,
          this.product_filter_options
        );
      } catch (ex) {
        this.message = "Error OEM references.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductSuppliers: async function() {
      if (this.product_suppliers === null) return;
      this.in_process++;
      this.message = "Saving suppliers...";
      try {
        await Vue.mtapi.saveProductSuppliers(
          this.product.id,
          this.product_suppliers
        );
      } catch (ex) {
        this.message = "Error saving suppliers.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductImages: async function() {
      if (this.product_images === null) return;
      this.in_process++;
      this.message = "Saving images...";
      try {
        await Vue.mtapi.saveProductImages(this.product.id, this.product_images);
      } catch (ex) {
        this.message = "Error saving images.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductMarketingRegions: async function() {
      if (this.product_marketing_regions === null) return;

      let params = this.product_marketing_regions.map(region_id => {
        return {
          product_id: this.product.id,
          marketing_region_id: region_id
        };
      });

      this.in_process++;
      this.message = "Saving marketing regions...";
      try {
        await Vue.mtapi.saveProductMarketingRegions(this.product.id, params);
      } catch (ex) {
        this.message = "Error saving marketing regions.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductCustomAttributes: async function() {
      if (this.product_custom_attributes === null) return;
      this.in_process++;
      this.message = "Saving custom attributes...";
      try {
        await Vue.mtapi.saveProductCustomAttributes(
          this.product.id,
          this.product_custom_attributes
        );
      } catch (ex) {
        this.message = "Error saving custom attributes.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductOemReferences: async function() {
      if (this.product_oem_refs === null) return;
      this.in_process++;
      this.message = "Saving OEM references...";
      try {
        await Vue.mtapi.saveProductOemReferences(
          this.product.id,
          this.product_oem_refs
        );
      } catch (ex) {
        this.message = "Error OEM references.";
        this.error = ex.message;
      } finally {
        this.in_process--;
        this.message = "";
      }
    },
    saveProductSets: async function() {
      if (this.product_sets === null) return;
      this.in_process++;
      this.message = "Saving set...";
      try {
        await Vue.mtapi.saveProductSets(this.product.id, this.product_sets);
      } catch (ex) {
        this.message = "Error saving set.";
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
    validateSKU: async function(e) {
      console.log("validateSKU", e);
    },
    hitSKU: async function(sku) {
      console.log("sku selected", sku);
      //let selected_product = this.all_products.find(p => p.sku == sku);
      //this.$router.push({ path: `/product/${selected_product.id}` });
      //window.location.reload();
    },
    topAncestorCategoryFor: function(category_id) {
      let cat = this.$store.state.categories.find(c => {
        return c.id === category_id;
      });
      if (!cat) return null;
      //has a parent?
      if (cat.parent_id) return this.topAncestorCategoryFor(cat.parent_id);
      //else this is it.
      return cat;
    },
    logFilter: function(e) {
      console.log("e", e, this.filters);
    },
    handleImageMove: function(e) {
      this.product_images.map((item, index) => {
        item.priority_order = index;
      });
      console.log("e", e, this.product_images);
    },
    handleDeleteProduct: function() {
      this.deleteProduct(this.product.id);
      //TODO : show notification
      this.$router.push({ path: `/search/product` });
    },
    convertKilosToPound: function() {
      //this.product.weight_lbs = this.product.weight_kg * 2.205;
      Vue.set(this.product, "weight_lbs", this.product.weight_kg * 2.205);
    },
    calculateZHPrice: function() {
      //this.product.price_zh = this.product.price_us * 6.97;
      Vue.set(this.product, "price_zh", this.product.price_us * 6.97);
    },
    calculateEUPrice: function() {
      //this.product.price_eu = this.product.price_us * 0.87;
      Vue.set(this.product, "price_eu", this.product.price_us * 0.87);
    },
    toggleSection: function(index) {
      //this.hide_section.$set(index, !this.hide_section[index]);
      Vue.set(this.hide_section, index, !this.hide_section[index]);
      //this.hide_section[index] = !this.hide_section[index];
    },
    addRelatedFamily: function() {
      this.related_families.push(this.selected_family.id);
      this.selected_family = null;
    },
    addRelatedEquipment: function() {
      this.related_equipments.push(this.selected_equipment.id);
      this.selected_equipment = null;
    },
    openCategoryEditModal() {
      this.edit_category_id = this.product.category_id;
      this.$bvModal.show("category-edit-modal");
    },
    cancelSaveCategoryId() {
      this.$bvModal.hide("category-edit-modal");
    },
    confirmSaveCategoryId() {
      this.product.category_id = this.edit_category_id;
      this.$bvModal.hide("category-edit-modal");
    },
    openBrandEditModal() {
      this.edit_brand_id = this.product.oem_brand_id;
      this.$bvModal.show("brand-edit-modal");
    },
    cancelSaveBrandId() {
      this.$bvModal.hide("brand-edit-modal");
    },
    confirmSaveBrandId() {
      this.product.oem_brand_id = this.edit_brand_id;
      this.$bvModal.hide("brand-edit-modal");
    },
    getChildren(parent) {
      this.sibling_ids.push(parent.id);
      if (parent.children) {
        parent.children.map(item => {
          this.getChildren(item);
        });
      }
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
.product-id {
  background-color: #d4e1f4;
  border-radius: 5px;
  border: 2px solid #a3b4ce;
  height: 46px;
}
.custom-product-tags {
  label {
    background-color: #009900;
    margin-left: 5px;
    padding-left: 20px !important;
    color: white;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
  }
  .bv-no-focus-ring {
    padding-left: 0px;
    .form-control {
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
    }
  }
  .badge.b-form-tag {
    background-color: #009900;
  }
  .b-form-tags-button {
    background-color: #d4e1f4;
    border: 1px solid #39577c;
    color: #39577c;
    font-weight: bold;
  }
}
input:not(.vs__search),
input:not(.vue-treeselect__input),
textarea,
select {
  border: 2px solid #9bb6c4 !important;
  border-radius: 5px !important;
}
input.vue-treeselect__input,
input.vs__search,
input.b-form-tags-input {
  border: none !important;
}
.custom-top-card {
  label {
    margin: 0px;
    padding: 8px 10px;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    color: white;
    font-weight: bold;
  }
  .bv-no-focus-ring {
    textarea {
      border-top-left-radius: 0px !important;
      border-top-right-radius: 0px !important;
      border-top: none !important;
    }
  }
}
.custom-red {
  label {
    background-color: #ff3334;
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
}
.price-manual {
  font-size: 12px;
}
.price-form {
  .input-group {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .input-group-text {
    background-color: #ff9737;
    color: white;
    font-size: 13px;
    border: 2px solid #9bb6c4;
    border-right: none;
    font-weight: 600;
  }
  input {
    max-width: 80px !important;
    margin-right: 20px;
    height: 35px !important;
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-left: none;
  }
}
.weight-form {
  .input-group {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .input-group-text {
    background-color: #019a00;
    color: white;
    font-size: 13px;
    border: 2px solid #9bb6c4;
    border-right: none;
    font-weight: 600;
  }
  input {
    max-width: 80px !important;
    margin-right: 20px;
    height: 35px !important;
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-left: none;
  }
}
.custom-btn {
  height: 35px;
  background-color: #b9d0ef;
  color: #113359;
  font-weight: 500;
  border: 2px solid;
  padding: 0px 10px;
}
.form-control:disabled {
  background-color: #e7cfdf;
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
    .vs__dropdown-toggle {
      border-top-left-radius: 0px !important;
      border-bottom-left-radius: 0px !important;
      border-left: none !important;
      height: calc(1.5em + 0.75rem + 2px);
      border: 2px solid #9bb6c4;
    }
    .search-input {
      border-top-left-radius: 0px !important;
      border-bottom-left-radius: 0px !important;
      border-left: none !important;
      height: calc(1.5em + 0.75rem + 2px);
      border: 2px solid #9bb6c4;
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
input,
select,
textarea {
  box-shadow: none !important;
  &:focus {
    box-shadow: none !important;
  }
}
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
.custom-orange {
  legend {
    background-color: #ff9934;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    padding-left: 20px;
    height: calc(1.5em + 0.75rem + 2px);
    border: 2px solid #9bb6c4;
    border-right: none;
    color: white;
    font-weight: 600;
  }
  input {
    height: calc(1.5em + 0.75rem + 2px);
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-left: none !important;
  }
}
.category-form {
  .input-group {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .input-group-text {
    background-color: #ff9737;
    color: white;
    font-size: 13px;
    border: 2px solid #9bb6c4;
    border-right: none;
    font-weight: 600;
  }
  input {
    height: 35px !important;
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-left: none;
  }
}
.custom-red {
  color: #d83232;
}
.edit-pencil {
  font-size: 26px;
  margin-top: 5px;
  cursor: pointer;
}
.brand-form {
  .input-group-text {
    background-color: #6c9355;
    border: 2px solid #3b6b34;
    height: calc(1.5em + 0.75rem + 2px);
    color: white;
    font-weight: 600;
    border-right: none !important;
  }
  input {
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-left: none !important;
    border: 2px solid #3b6b34 !important;
  }
}
.custom-light-pink {
  legend {
    background-color: #b6759f;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    padding-left: 20px;
    height: calc(1.5em + 0.75rem + 2px);
    border: 2px solid #9bb6c4;
    border-right: none;
    color: white;
    font-weight: 600;
  }
}
.custom-green {
  legend {
    background-color: #6c9355;
    color: white;
    font-weight: 600;
  }
}
.product button {
  margin: 20px 0px;
}
.custom-attribute-form {
  .input-group-text {
    background-color: #cb0468;
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
p.strong {
  font-weight: bold;
  margin: 10px 0px;
}
#g_p_marketing_regions {
  align-items: center;
}
#g_p_is_oem {
  margin-bottom: 0px;
  margin-top: 8px;
}
#g_p_certificates {
  align-items: center;
}
.input-group.title-form {
  align-items: center;
}
.related-families {
  display: flex;
  .form-row {
    .bv-no-focus-ring.col {
      display: flex;
    }
  }
  button {
    margin-left: 15px;
  }
}
#g_display_family_connections {
  align-items: center;
  p {
    margin: 0px;
  }
}
#g_p_group {
  align-items: center;
}
label {
  font-weight: 600 !important;
}
.filters-div legend {
  cursor: pointer;
}
.image-form {
  margin-bottom: 15px;
}
#g_display_equipment_connections {
  display: flex;
  align-items: center;
  p {
    margin: 0px;
  }
}
.control-btn-groups {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
