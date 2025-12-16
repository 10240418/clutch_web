<script setup lang="ts">
import { ref } from 'vue';
import { usePalletData } from './usePallet';
import { Pallet } from '@/model/managementModels';
import PalletDetailDialog from './components/PalletDetailDialog.vue';

const { columns, pagination, searchKeyword, data, isLoading, list } = usePalletData();

const selectedPallet = ref<Pallet | null>(null);
const isDetailDialogVisible = ref(false);

const showDetailDialog = (record: Pallet) => {
    selectedPallet.value = record;
    isDetailDialogVisible.value = true;
};

const onPageChange = () => {
    list();
};

const onSearch = () => {
    pagination.value.pageNum = 1;
    list();
};

// Load data when component is mounted
list();
</script>

<template>
    <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <a-input-search v-model:value="searchKeyword" placeholder="按托盘SN或电机SN搜索" style="width: 300px;"
                @search="onSearch" />
        </div>

        <a-table :columns="columns" :data-source="data" :pagination="false" :loading="isLoading">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                    <a>{{ record.id }}</a>
                </template>
                <template v-else-if="column.key === 'action'">
                    <span>
                        <a @click="showDetailDialog(record)">详细信息</a>
                    </span>
                </template>
            </template>
        </a-table>

        <a-pagination class="mt15" v-model:current="pagination.pageNum" v-model:pageSize="pagination.pageSize"
            :total="pagination.total" show-size-changer @change="onPageChange"
            style="margin-top: 16px; text-align: right;" />

        <PalletDetailDialog :visible="isDetailDialogVisible" :palletData="selectedPallet"
            @update:visible="isDetailDialogVisible = $event" />
    </div>
</template>

<style scoped>
.mt15 {
    margin-top: 15px;
}
</style>
