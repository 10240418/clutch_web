<script setup lang="ts">
import { onMounted } from "vue";
import { useProductionPlanData } from "./useProductionPlan";

const {
  columns,
  pagination,
  searchKeyword,
  selectedDate,
  data,
  list,
  handleImport,
  exportToExcel,
  isLoading,
} = useProductionPlanData();

const onPageChange = () => {
  list();
};

const onSearch = () => {
  pagination.value.pageNum = 1;
  list();
};

const onDateChange = () => {
  pagination.value.pageNum = 1;
  list();
};

const customRequest = async (options: any) => {
  const { file, onSuccess, onError } = options;
  try {
    await handleImport(file);
    onSuccess("ok");
  } catch (err) {
    onError(err);
  }
};

onMounted(() => {
  list();
});
</script>

<template>
  <div>
    <div
      style="display: flex; justify-content: space-between; margin-bottom: 16px;"
    >
      <div style="display: flex; gap: 8px; align-items: center;">
        <a-date-picker
          v-model:value="selectedDate"
          format="YYYY-MM-DD"
          placeholder="选择日期"
          @change="onDateChange"
        />
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="按部品号或厂家搜索"
          style="width: 300px;"
          @search="onSearch"
        />
      </div>
      <div style="display: flex; gap: 8px;">
        <a-button
          @click="exportToExcel"
          type="default"
        >
          <template #icon>
            <download-outlined />
          </template>
          导出文件
        </a-button>
        <a-upload
          :customRequest="customRequest"
          :show-upload-list="false"
          accept=".xlsx, .xls"
        >
          <a-button type="primary">
            <template #icon>
              <upload-outlined />
            </template>
            导入计划
          </a-button>
        </a-upload>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="false"
      :loading="isLoading"
      :scroll="{ x: 2000 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'id'">
          <a>{{ record.id }}</a>
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
  </div>
</template>

<style scoped>
.mt15 {
  margin-top: 15px;
}
</style>
