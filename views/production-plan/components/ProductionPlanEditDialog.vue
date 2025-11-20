<script setup lang="ts">
// This component is currently unused and incompatible with the new ProductionPlan model.
// import { ref, defineProps, watch, defineEmits, onMounted } from 'vue';
// import { ProductionPlan } from '@/model/managementModels';
// import { useProductionPlanData } from '../useProductionPlan';
// import dayjs, { Dayjs } from 'dayjs';

// const props = defineProps({
//     visible: Boolean,
//     mode: {
//         type: String,
//         default: 'create', // 'create' or 'edit'
//     },
//     productionPlanData: {
//         type: Object as () => ProductionPlan | null,
//         default: null
//     },
// });

// const emit = defineEmits(['update:visible', 'created', 'updated', 'cancel']);

// const formRef = ref();
// const formData = ref<ProductionPlan>({} as ProductionPlan);
// const { create, update, productModels, loadProductModels } = useProductionPlanData();
// const isLoading = ref(false);
// const selectedDate = ref<Dayjs>(dayjs());

// onMounted(async () => {
//     await loadProductModels();
// });

// watch(() => props.visible, (visible) => {
//     if (visible) {
//         if (props.mode === 'edit' && props.productionPlanData) {
//             formData.value = { ...props.productionPlanData };
//             if (formData.value.startAt) {
//                 selectedDate.value = dayjs(formData.value.startAt);
//             }
//         } else {
//             formData.value = {
//                 belongsTo: '',
//                 productModelId: undefined,
//                 planned: 0,
//                 startAt: new Date(),
//                 endAt: new Date()
//             } as ProductionPlan;
//             selectedDate.value = dayjs();
//         }
//     }
// }, { immediate: true });

// // 监听日期选择变化，自动设置开始和结束时间以及归属日期
// watch(selectedDate, (newDate) => {
//     if (newDate) {
//         // 设置开始时间为当天 00:00:00
//         formData.value.startAt = newDate.startOf('day').format();
//         // 设置结束时间为当天 23:59:59
//         formData.value.endAt = newDate.endOf('day').format();
//         // 设置归属日期为 yyyy/mm/dd 格式
//         formData.value.belongsTo = newDate.format('YYYY/MM/DD');
//     }
// });

// const handleCancel = () => {
//     emit('update:visible', false);
//     emit('cancel');
// };

// const handleSubmit = () => {
//     formRef.value.validate().then(() => {
//         isLoading.value = true;

//         const productionPlanData = { ...formData.value };
//         // 日期已经在 watch 函数中设置好了，这里不需要额外处理

//         const promise = props.mode === 'create'
//             ? create(productionPlanData)
//             : update(productionPlanData);

//         promise
//             .then((response) => {
//                 if (props.mode === 'create') {
//                     emit('created', response);
//                 } else {
//                     emit('updated', response);
//                 }
//             })
//             .finally(() => {
//                 isLoading.value = false;
//             });
//     });
// };
</script>

<template>
    <!-- <a-modal :open="visible" @cancel="handleCancel" :title="mode === 'create' ? '添加生产计划' : '编辑生产计划'"
        :mask-closable="false" :confirmLoading="isLoading" @ok="handleSubmit">
        <a-form ref="formRef" :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-form-item label="计划时间" name="startAt" :rules="[{ required: true, message: '请选择生产日期!' }]">
                <a-date-picker v-model:value="selectedDate" style="width: 100%" format="YYYY-MM-DD" />
            </a-form-item>

            <a-form-item label="归属" name="belongsTo" :rules="[{ required: true, message: '请输入归属!' }]">
                <a-input v-model:value="formData.belongsTo" readonly />
            </a-form-item>

            <a-form-item label="产品型号" name="productModelId" :rules="[{ required: true, message: '请选择产品型号!' }]">
                <a-select v-model:value="formData.productModelId" show-search option-filter-prop="label">
                    <a-select-option v-for="model in productModels" :key="model.id" :value="model.id"
                        :label="`${model.description} (${model.sap})`">
                        {{ model.description }} ({{ model.sap }})
                    </a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item label="数量" name="planned" :rules="[{ required: true, message: '请输入计划数量!' }]">
                <a-input-number v-model:value="formData.planned" :min="0" style="width: 100%" />
            </a-form-item>


        </a-form>
    </a-modal> -->
    <div></div>
</template>
