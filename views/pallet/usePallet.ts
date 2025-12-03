import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { getPallets, getProducts } from '@/httpapis/management';
import { Pallet, Product } from '@/model/managementModels';
import dayjs from 'dayjs';

export const usePalletData = () => {
    const isLoading = ref(false);
    const data = ref<Pallet[]>([]);
    const pagination = ref({
        pageNum: 1,
        pageSize: 10,
        total: 0,
    });
    const searchKeyword = ref('');

    const columns = [
        {
            title: '产品型号',
            dataIndex: ['productModel', 'description'],
            key: 'productModel',
        },
        {
            title: '物料编码',
            dataIndex: ['productModel', 'sn'],
            key: 'materialCode',
        },
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 40,
        },
        {
            title: '托盘SN',
            dataIndex: 'sn',
            key: 'sn',
        },
        {
            title: '产品线',
            dataIndex: ['productLine', 'name'],
            key: 'productLine',
        },
        {
            title: '目标数量',
            dataIndex: 'goal',
            key: 'goal',
        },
        {
            title: '开始时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            customRender: ({ text }: { text: string }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '',
        },
        {
            title: '操作',
            key: 'action',
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
            const response = await getPallets(query);
            data.value = response.data.data;
            pagination.value.total = response.data.pagination.total;
        } catch (error: any) {
            message.error(`Failed to list pallets: ${error.response?.data?.error || error.message}`);
            return Promise.reject(error);
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
    };
};

// 托盘详情数据管理
export const usePalletDetail = () => {
    const products = ref<Product[]>([]);
    const isLoadingProducts = ref(false);

    const productColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'SN',
            dataIndex: 'sn',
            key: 'sn',
        },
        {
            title: '生产计划',
            dataIndex: ['productionPlan', 'belongsTo'],
            key: 'productionPlan',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            customRender: ({ text }: { text: string }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '',
        },
    ];

    const loadProducts = async (palletId: number) => {
        if (!palletId) return;

        isLoadingProducts.value = true;
        try {
            const response = await getProducts({ palletId, pageSize: 1000 });
            products.value = response.data.data || [];
        } catch (error: any) {
            message.error(`Failed to load products: ${error.response?.data?.error || error.message}`);
        } finally {
            isLoadingProducts.value = false;
        }
    };

    const resetProducts = () => {
        products.value = [];
    };

    const formatDateTime = (date: string) => {
        return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '';
    };

    return {
        products,
        isLoadingProducts,
        productColumns,
        loadProducts,
        resetProducts,
        formatDateTime,
    };
};
