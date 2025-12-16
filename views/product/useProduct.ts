import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { getProducts, getProductLines } from '@/httpapis/management';
import { Product, ProductLine } from '@/model/managementModels';
import dayjs, { Dayjs } from 'dayjs';
import ExcelJS from 'exceljs';

interface ProductQueryParams {
    pageNum: number;
    pageSize: number;
    startTime?: string;
    endTime?: string;
    description?: string;  // 同时模糊查询产品型号描述和电机SN
    productLineId?: number;
    hasDefect?: boolean;
    defectReason?: string;
}

export const useProductData = () => {
    const isLoading = ref(false);
    const isLoadingProducts = ref(false);
    const data = ref<Product[]>([]);
    const products = ref<Product[]>([]);
    const productLines = ref<ProductLine[]>([]);
    const pagination = ref({
        pageNum: 1,
        pageSize: 10,
        total: 0,
    });

    // Filter parameters
    const searchKeyword = ref('');
    const selectedProductLineId = ref<number | undefined>(undefined);
    const dateRange = ref<[Dayjs, Dayjs] | []>([]);
    const hasDefect = ref<boolean | undefined>(undefined);
    const defectReason = ref<string | undefined>(undefined);

    // 缺陷原因选项
    const defectReasonOptions = ref([
        { label: '外观不良', value: '外观不良' },
        { label: '绝缘耐压不良', value: '绝缘耐压不良' },
        { label: '反电动势不良', value: '反电动势不良' },
        { label: '电阻不良', value: '电阻不良' },
        { label: '噪音不良', value: '噪音不良' },
    ]);

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
            title: '电机SN',
            dataIndex: 'sn',
            key: 'sn',
        },
        {
            title: '产品线',
            dataIndex: ['productLine', 'name'],
            key: 'productLine',
        },
        {
            title: '生产计划',
            dataIndex: ['productionPlan', 'belongsTo'],
            key: 'productionPlan',
        },
        {
            title: '托盘',
            dataIndex: ['pallet', 'sn'],
            key: 'pallet',
        },
        {
            title: '录入时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            customRender: ({ text }: { text: string }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '',
        },
        {
            title: '检测结果',
            dataIndex: 'hasDefect',
            key: 'hasDefect',
        },
        {
            title: '操作',
            key: 'action',
        },
    ];

    const productColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: '电机 SN',
            dataIndex: 'sn',
            key: 'sn',
        },
        {
            title: '入库时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            customRender: ({ text }: { text: string }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '',
        },
        {
            title: '托盘 SN',
            dataIndex: ['pallet', 'sn'],
            key: 'pallet',
        },
        {
            title: '产品线',
            dataIndex: ['productLine', 'name'],
            key: 'productLine',
        },
    ];

    const list = async () => {
        isLoading.value = true;
        const query: ProductQueryParams = {
            pageNum: pagination.value.pageNum,
            pageSize: pagination.value.pageSize,
        };

        // If no search keyword and no other filters, do not load data
        if (!searchKeyword.value && !selectedProductLineId.value && (!dateRange.value || dateRange.value.length === 0) && hasDefect.value === undefined) {
            data.value = [];
            pagination.value.total = 0;
            isLoading.value = false;
            return;
        }

        // Add filters if they have values
        if (searchKeyword.value) query.description = searchKeyword.value;
        if (selectedProductLineId.value) query.productLineId = selectedProductLineId.value;
        if (hasDefect.value !== undefined) query.hasDefect = hasDefect.value;
        if (defectReason.value) query.defectReason = defectReason.value;

        // Handle date range
        if (dateRange.value && dateRange.value.length === 2) {
            query.startTime = dateRange.value[0].format('YYYY-MM-DD HH:mm:ss');
            query.endTime = dateRange.value[1].format('YYYY-MM-DD HH:mm:ss');
        }

        try {
            const response = await getProducts(query);
            const products = response.data.data;

            data.value = products;
            pagination.value.total = response.data.pagination.total;
        } catch (error: any) {
            message.error(`Failed to list products: ${error.response?.data?.error || error.message}`);
            return Promise.reject(error);
        } finally {
            console.log('finally');
            isLoading.value = false;
        }
    };

    const loadProductLines = async () => {
        try {
            const response = await getProductLines({ pageSize: 100 });
            productLines.value = response.data.data;
        } catch (error: any) {
            message.error(`Failed to load product lines: ${error.response?.data?.error || error.message}`);
        }
    };

    const loadPalletProducts = async (palletId: number) => {
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

    const resetFilters = () => {
        searchKeyword.value = '';
        selectedProductLineId.value = undefined;
        dateRange.value = [];
        hasDefect.value = undefined;
        defectReason.value = undefined;
        pagination.value.pageNum = 1;
    };



    // Excel导出功能
    const exportToExcel = async () => {
        if (!products.value || products.value.length === 0) {
            message.warning('没有数据可以导出');
            return;
        }

        try {
            // 创建工作簿
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('产品数据');

            // 先设置列宽
            worksheet.columns = [
                { width: 10 },  // ID
                { width: 25 },  // 电机 SN
                { width: 20 },  // 入库时间
                { width: 20 },  // 托盘 SN
                { width: 15 }   // 产品线
            ];

            // 添加汇总信息行
            const totalCount = products.value.length;
            const palletNumbers = [...new Set(products.value.map(p => p.pallet?.sn).filter(Boolean))];
            const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');

            // 第1行：总计
            worksheet.addRow(['总计:', `${totalCount} 件`, '', '', '']);
            // 第2行：托盘号
            worksheet.addRow(['托盘号:', palletNumbers.join(', ') || '无', '', '', '']);
            // 第3行：导出日期
            worksheet.addRow(['导出日期:', currentDate, '', '', '']);
            // 第5行：表头
            worksheet.addRow(['ID', '电机 SN', '入库时间', '托盘 SN', '产品线']);

            // 添加数据
            products.value.forEach((product: Product) => {
                worksheet.addRow([
                    product.id,
                    product.sn,
                    product.createdAt ? dayjs(product.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
                    product.pallet?.sn || '',
                    product.productLine?.name || ''
                ]);
            });

            // 设置汇总信息行样式（前3行）
            for (let i = 1; i <= 3; i++) {
                const row = worksheet.getRow(i);
                row.height = 22;
                row.eachCell((cell, colNumber) => {
                    if (colNumber <= 2) { // 只对前两列设置样式
                        cell.font = { bold: true, size: 12, color: { argb: '00000000' } };
                        if (colNumber === 1) {
                            cell.alignment = { vertical: 'middle', horizontal: 'right' };
                        } else {
                            cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        }
                    }
                });
                // 合并第2-5列用于显示完整内容
                worksheet.mergeCells(`B${i}:E${i}`);
            }

            // 设置表头行样式（第4行）
            const headerRow = worksheet.getRow(4);
            headerRow.height = 15;
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, size: 12, color: { argb: '00000000' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE6F3FF' }
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: '00000000' } },
                    left: { style: 'thin', color: { argb: '00000000' } },
                    bottom: { style: 'thin', color: { argb: '00000000' } },
                    right: { style: 'thin', color: { argb: '00000000' } }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            // 设置数据行样式（从第6行开始）
            for (let i = 5; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i);
                row.height = 20;
                row.eachCell((cell) => {
                    cell.font = { size: 11, color: { argb: '00000000' } };
                    cell.border = {
                        top: { style: 'thin', color: { argb: '00000000' } },
                        left: { style: 'thin', color: { argb: '00000000' } },
                        bottom: { style: 'thin', color: { argb: '00000000' } },
                        right: { style: 'thin', color: { argb: '00000000' } }
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                });
            }

            // 生成文件名
            const fileName = `追溯数据_${dayjs().format('YYYY-MM-DD')}.xlsx`;

            // 导出文件
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            message.success('导出成功');
        } catch (error: any) {
            console.error('导出错误:', error);
            message.error(`导出失败: ${error.message}`);
        }
    };

    return {
        isLoading,
        isLoadingProducts,
        data,
        productLines,
        products,
        columns,
        productColumns,
        pagination,
        searchKeyword,
        selectedProductLineId,
        dateRange,
        hasDefect,
        defectReason,
        defectReasonOptions,
        list,
        loadProductLines,
        resetFilters,
        loadPalletProducts,
        exportToExcel
    };
};
