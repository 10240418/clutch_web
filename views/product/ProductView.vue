<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useProductData } from "./useProduct";
import { Product } from "@/model/managementModels";
import ProductDetailDialog from "./components/ProductDetailDialog.vue";

const {
  columns,
  pagination,
  searchKeyword,
  selectedProductLineId,
  dateRange,
  hasDefect,
  defectReason,
  defectReasonOptions,
  data,
  isLoading,
  productLines,
  list,
  loadProductLines,
  resetFilters,
} = useProductData();

const selectedProduct = ref<Product | null>(null);
const isDetailDialogVisible = ref(false);

// 手动搜索函数
const handleSearch = () => {
  pagination.value.pageNum = 1;
  list();
};

// 监听是否有缺陷变化，清空缺陷原因但不触发搜索
watch(hasDefect, () => {
  // 如果取消勾选有缺陷，清空缺陷原因
  if (hasDefect.value === false || hasDefect.value === undefined) {
    defectReason.value = undefined;
  }
});

const showDetailDialog = (record: Product) => {
  selectedProduct.value = record;
  isDetailDialogVisible.value = true;
};

const onPageChange = () => {
  list();
};

const onReset = () => {
  resetFilters();
};

// Load product lines when component is mounted (but don't load product data)
onMounted(async () => {
  await loadProductLines();
});
</script>

<template>
  <div>
    <!-- Basic Search and Action Bar -->
    <div
      style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;"
    >
      <div style="display: flex; gap: 8px; align-items: center;">
        <a-range-picker
          v-model:value="dateRange"
          format="YYYY-MM-DD HH:mm"
          :showTime="{ format: 'HH:mm' }"
        />
        <a-select
          v-model:value="selectedProductLineId"
          placeholder="选择产品线"
          allowClear
          style="width: 150px;"
        >
          <a-select-option
            v-for="line in productLines"
            :key="line.id"
            :value="line.id"
          >
            {{ line.name }}
          </a-select-option>
        </a-select>
        <a-input
          v-model:value="searchKeyword"
          placeholder="输入产品型号或电机SN查询"
          style="width: 240px;"
          allowClear
          @pressEnter="handleSearch"
        />
        <a-button
          type="primary"
          @click="handleSearch"
          :disabled="!searchKeyword && !selectedProductLineId && (!dateRange || dateRange.length === 0)"
        >搜索</a-button>

        <a-checkbox v-model:checked="hasDefect">有缺陷</a-checkbox>
        <a-select
          v-model:value="defectReason"
          placeholder="选择缺陷原因"
          allowClear
          v-if="hasDefect"
        >
          <a-select-option
            v-for="option in defectReasonOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>

      </div>
      <a-button @click="onReset">重置筛选</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="false"
      :loading="isLoading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'id'">
          <a>{{ record.id }}</a>
        </template>
        <template v-else-if="column.key === 'hasDefect'">
          <a-tag
            v-if="!record.hasDefect"
            color="green"
          >合格</a-tag>
          <a-tag
            v-else
            color="red"
          >{{ record.defectReason || '异常' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <span>
            <a @click="showDetailDialog(record)">详细信息</a>
          </span>
        </template>
      </template>
    </a-table>

    <a-pagination
      class="mt15"
      v-model:current="pagination.pageNum"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      show-size-changer
      @change="onPageChange"
      style="margin-top: 16px; text-align: right;"
    />

    <ProductDetailDialog
      :visible="isDetailDialogVisible"
      :productData="selectedProduct"
      @update:visible="isDetailDialogVisible = $event"
    />
  </div>
</template>

<style scoped>
.mt15 {
  margin-top: 15px;
}
</style>
