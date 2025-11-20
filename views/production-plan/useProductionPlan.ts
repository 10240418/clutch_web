import { ref } from 'vue';
import { message } from 'ant-design-vue';
import {
    getProductionPlans,
    importProductionPlan,
} from '@/httpapis/management';
import { ProductionPlan } from '@/model/managementModels';
import dayjs from 'dayjs';

export const useProductionPlanData = () => {
    const isLoading = ref(false);
    const data = ref<ProductionPlan[]>([]);
    const pagination = ref({
        pageNum: 1,
        pageSize: 10,
        total: 0,
    });
    const searchKeyword = ref('');

    const columns = [
        {
            title: '物料编码',
            dataIndex: 'materialCode',
            key: 'materialCode',
            width: 120,
            fixed: 'left',
        },
        {
            title: '部品号',
            dataIndex: 'partNumber',
            key: 'partNumber',
            width: 150,
            fixed: 'left',
        },
        {
            title: '直流/交流',
            dataIndex: 'type',
            key: 'type',
            width: 100,
        },
        {
            title: '厂家',
            dataIndex: 'manufacturer',
            key: 'manufacturer',
            width: 150,
        },
        {
            title: '计划输入日期',
            dataIndex: 'planDate',
            key: 'planDate',
            width: 120,
            customRender: ({ text }: { text: string }) => text ? dayjs(text).format('YYYY-MM-DD') : '',
        },
        {
            title: '生产线体',
            dataIndex: 'productionLine',
            key: 'productionLine',
            width: 120,
        },
        {
            title: 'T计划数',
            dataIndex: 'tPlanned',
            key: 'tPlanned',
            width: 100,
        },
        {
            title: 'T完成数',
            dataIndex: 'tActual',
            key: 'tActual',
            width: 100,
        },
        {
            title: 'T未完成数',
            dataIndex: 'tUnfinished',
            key: 'tUnfinished',
            width: 100,
        },
        {
            title: 'T1计划数',
            dataIndex: 't1Planned',
            key: 't1Planned',
            width: 100,
        },
        {
            title: 'T1完成数',
            dataIndex: 't1Actual',
            key: 't1Actual',
            width: 100,
        },
        {
            title: 'T1未完成数',
            dataIndex: 't1Unfinished',
            key: 't1Unfinished',
            width: 100,
        },
        {
            title: 'T2计划数',
            dataIndex: 't2Planned',
            key: 't2Planned',
            width: 100,
        },
        {
            title: 'T2完成数',
            dataIndex: 't2Actual',
            key: 't2Actual',
            width: 100,
        },
        {
            title: 'T2未完成数',
            dataIndex: 't2Unfinished',
            key: 't2Unfinished',
            width: 100,
        },
        {
            title: 'T3计划数',
            dataIndex: 't3Planned',
            key: 't3Planned',
            width: 100,
        },
        {
            title: 'T3完成数',
            dataIndex: 't3Actual',
            key: 't3Actual',
            width: 100,
        },
        {
            title: 'T3未完成数',
            dataIndex: 't3Unfinished',
            key: 't3Unfinished',
            width: 100,
        },
        {
            title: '计划数',
            dataIndex: 'totalPlanned',
            key: 'totalPlanned',
            width: 100,
        },
        {
            title: '检验数',
            dataIndex: 'totalInspected',
            key: 'totalInspected',
            width: 100,
        },
        {
            title: '未完成数',
            dataIndex: 'totalUnfinished',
            key: 'totalUnfinished',
            width: 100,
        },
        {
            title: '达成率',
            dataIndex: 'achievementRate',
            key: 'achievementRate',
            width: 100,
            customRender: ({ text }: { text: number }) => text ? `${text.toFixed(2)}%` : '0.00%',
        },
        {
            title: '特殊物料备注',
            dataIndex: 'specialNote',
            key: 'specialNote',
            width: 150,
        },
    ];

    const list = async () => {
        isLoading.value = true;
        const query = {
            pageNum: pagination.value.pageNum,
            pageSize: pagination.value.pageSize,
            keyword: searchKeyword.value,
        };
        try {
            const response = await getProductionPlans(query);
            data.value = response.data.data;
            pagination.value.total = response.data.pagination.total;
        } catch (error: any) {
            message.error(`Failed to list production plans: ${error.response?.data?.error || error.message}`);
            return Promise.reject(error);
        } finally {
            isLoading.value = false;
        }
    };

    const handleImport = async (file: File) => {
        isLoading.value = true;
        try {
            await importProductionPlan(file);
            message.success('Production plan imported successfully');
            await list(); // Refresh list
        } catch (error: any) {
            message.error(`Failed to import production plan: ${error.response?.data?.error || error.message}`);
        } finally {
            isLoading.value = false;
        }
    };

    return {
        isLoading,
        data,
        columns,
        pagination,
        searchKeyword,
        list,
        handleImport,
    };
};
