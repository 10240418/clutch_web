<script setup lang="ts">
import { onMounted, watch } from "vue";
import dayjs from "dayjs";
import { useInspectionReportData } from "./useInspectionReport";

const {
  columns,
  pagination,
  dateRange,
  inputProductModelSN,
  inputBatchNumber,
  inputSupplierName,
  selectedProductLineId,
  productLines,
  data,
  isLoading,
  list,
  resetFilters,
  exportToExcel,
  loadProductLines,
} = useInspectionReportData();

let searchTimeout: NodeJS.Timeout | null = null;
const autoSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.pageNum = 1;
    list();
  }, 500);
};

watch(dateRange, autoSearch, { deep: true });
watch(inputProductModelSN, autoSearch);
watch(inputBatchNumber, autoSearch);
watch(inputSupplierName, autoSearch);
watch(selectedProductLineId, autoSearch);

const onPageChange = () => list();
const onReset = () => {
  resetFilters();
  list();
};
const onExport = () => exportToExcel();

onMounted(async () => {
  await loadProductLines();
  list();
});
</script>

<template>
  <div>
    <div
      style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;"
    >
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <a-range-picker
          v-model:value="dateRange"
          format="YYYY-MM-DD"
          :placeholder="['开始时间', '结束时间']"
        />
        <a-input
          v-model:value="inputProductModelSN"
          placeholder="物料编码"
          allowClear
          style="width:150px"
        />
        <a-input
          v-model:value="inputBatchNumber"
          placeholder="批次号"
          allowClear
          style="width:120px"
        />
        <a-input
          v-model:value="inputSupplierName"
          placeholder="供应商"
          allowClear
          style="width:180px"
        />
        <a-select
          v-model:value="selectedProductLineId"
          placeholder="选择产线"
          allowClear
          style="width:150px"
        >
          <a-select-option
            v-for="line in productLines"
            :key="line.id"
            :value="line.id"
          >
            {{ line.name }}
          </a-select-option>
        </a-select>
      </div>
      <div style="display:flex;gap:8px;">
        <a-button @click="onReset">重置筛选</a-button>
        <a-button
          type="primary"
          @click="onExport"
          :disabled="!data || data.length === 0"
        >导出Excel</a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="false"
      :loading="isLoading"
      size="middle"
      :scroll="{ x: 900 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'unqualifiedCount'">
          <a-tag
            :color="record.unqualifiedCount > 0 ? 'red' : 'green'">{{ record.unqualifiedCount }}</a-tag>
        </template>
        <template v-else-if="column.key === 'qualifiedCount'">
          <a-tag color="blue">{{ record.qualifiedCount }}</a-tag>
        </template>
        <template v-else-if="column.key === 'inspectionDate'">
          {{ record.inspectionDate ? dayjs(record.inspectionDate).format('YYYY-MM-DD') : '' }}
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
      style="margin-top:16px;text-align:right;"
    />
  </div>
</template>

<style scoped>
.mt15 {
  margin-top: 15px;
}
</style>
