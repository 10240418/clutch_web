<script setup lang="ts">
// This component is currently unused and incompatible with the new ProductionPlan model.
// import { ref, defineProps, watch, defineEmits } from 'vue';
// import { ProductionPlan } from '@/model/managementModels';
// import { formatDate } from '@/utils';

// const props = defineProps({
//     visible: Boolean,
//     productionPlanData: Object as () => ProductionPlan | null,
// });
// const emit = defineEmits(['update:visible', 'cancel']);

// const formData = ref<ProductionPlan>({} as ProductionPlan);

// watch(() => props.productionPlanData, (newData) => {
//     if (newData) {
//         formData.value = { ...newData };
//     }
// }, { immediate: true });

// const handleCancel = () => {
//     emit('update:visible', false);
//     emit('cancel');
// };

</script>

<template>
    <!-- <a-modal :open="visible" @cancel="handleCancel" title="生产计划详情" :mask-closable="false" :footer="null">
        <a-descriptions bordered :column="1">
            <a-descriptions-item label="ID">{{ formData.id }}</a-descriptions-item>
            <a-descriptions-item label="开始时间">{{ formatDate(formData.startAt) }}</a-descriptions-item>
            <a-descriptions-item label="结束时间">{{ formatDate(formData.endAt) }}</a-descriptions-item>
            <a-descriptions-item label="归属">{{ formData.belongsTo }}</a-descriptions-item>
            <a-descriptions-item label="产品型号">{{ formData.productModel?.description }} ({{
                formData.productModel?.sap }})</a-descriptions-item>
            <a-descriptions-item label="计划数量">{{ formData.planned }}</a-descriptions-item>
            <a-descriptions-item label="实际数量">{{ formData.actual }}</a-descriptions-item>
        </a-descriptions>

        <div style="text-align: right; margin-top: 16px;">
            <a-button @click="handleCancel">关闭</a-button>
        </div>
    </a-modal> -->
    <div></div>
</template>
