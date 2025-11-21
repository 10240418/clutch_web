<script setup lang="ts">
import { ref, defineProps, watch, defineEmits } from "vue";
import { Product } from "@/model/managementModels";
import { formatDateTime } from "@/utils";
import { useProductData } from "../useProduct";

const props = defineProps({
  visible: Boolean,
  productData: Object as () => Product | null,
});
const emit = defineEmits(["update:visible", "cancel"]);

const formData = ref<Product>({} as Product);

watch(
  () => props.productData,
  (newData) => {
    if (newData) {
      formData.value = { ...newData };
    }
  },
  { immediate: true }
);

const handleCancel = () => {
  emit("update:visible", false);
  emit("cancel");
};

const {
  isLoadingProducts,
  products,
  productColumns,
  loadPalletProducts,
  exportToExcel,
} = useProductData();

watch(
  () => props.visible,
  (visible) => {
    if (visible && props.productData?.pallet?.id) {
      loadPalletProducts(props.productData.pallet.id);
    }
  }
);
</script>

<template>
  <a-modal
    :open="visible"
    @cancel="handleCancel"
    title="电机详情"
    :mask-closable="false"
    :footer="null"
    width="1000px"
  >
    <a-descriptions
      bordered
      :column="1"
    >
      <a-descriptions-item label="ID">{{ formData.id }}</a-descriptions-item>
      <a-descriptions-item label="SN">{{ formData.sn }}</a-descriptions-item>
      <a-descriptions-item label="电机型号">{{ formData.productModel?.description }} ({{
                formData.productModel?.sap }})</a-descriptions-item>
      <a-descriptions-item
        label="产品线">{{ formData.productLine?.name }}</a-descriptions-item>
      <!-- <a-descriptions-item
        label="生产计划">{{ formData.productionPlan?.belongsTo }}</a-descriptions-item> -->
      <a-descriptions-item
        label="托盘 SN">{{ formData.pallet?.sn }}</a-descriptions-item>
      <a-descriptions-item
        label="创建时间">{{ formatDateTime(formData.createdAt) }}</a-descriptions-item>
    </a-descriptions>

    <!-- 电机列表 -->
    <div style="margin-top: 24px;">
      <h3>同托盘电机</h3>
      <div style="display: flex; gap: 8px;">
        <a-button
          @click="exportToExcel"
          type="primary"
          ghost
        >
          <template #icon>
            <download-outlined />
          </template>
          导出Excel
        </a-button>
      </div>
      <a-table
        :columns="productColumns"
        :data-source="products"
        :pagination="false"
        :loading="isLoadingProducts"
        size="small"
        :scroll="{ y: 300 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'id'">
            <a>{{ record.id }}</a>
          </template>
        </template>
      </a-table>
      <div style="margin-top: 8px; color: #666; font-size: 12px;">
        共 {{ products.length }} 台电机
      </div>
    </div>

    <div style="text-align: right; margin-top: 16px;">
      <a-button @click="handleCancel">关闭</a-button>
    </div>
  </a-modal>
</template>
