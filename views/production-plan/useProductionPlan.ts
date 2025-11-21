import { ref } from 'vue';
import { message } from 'ant-design-vue';
import {
    getProductionPlansByDate,
    importProductionPlan,
} from '@/httpapis/management';
import { ProductionPlan } from '@/model/managementModels';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';

export const useProductionPlanData = () => {
    const isLoading = ref(false);
    const data = ref<ProductionPlan[]>([]);
    const pagination = ref({
        pageNum: 1,
        pageSize: 10,
        total: 0,
    });
    const searchKeyword = ref('');
    const selectedDate = ref(dayjs()); // 默认选择今天

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
            width: 250,
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
        
        // 使用选择的日期，如果没有选择则使用今天
        const queryDate = selectedDate.value ? selectedDate.value.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        
        try {
            // 使用新的日期查询 API
            const response = await getProductionPlansByDate(queryDate);
            let plans = response.data.data;
            
            // 如果有搜索关键词，进行客户端过滤
            if (searchKeyword.value) {
                plans = plans.filter((plan: ProductionPlan) => 
                    plan.partNumber?.includes(searchKeyword.value) || 
                    plan.manufacturer?.includes(searchKeyword.value)
                );
            }
            
            data.value = plans;
            
            // 新接口不支持分页，返回全部数据
            pagination.value.total = plans.length;
            
            message.success(`已加载 ${queryDate} 的生产计划，共 ${plans.length} 条`);
        } catch (error: any) {
            message.error(`加载失败: ${error.response?.data?.error || error.message}`);
            return Promise.reject(error);
        } finally {
            isLoading.value = false;
        }
    };

    const handleImport = async (file: File) => {
        isLoading.value = true;
        try {
            // 1. 解析 Excel 文件
            const parsedData = await parseExcelFile(file);
            
            if (!parsedData || parsedData.length === 0) {
                message.warning('Excel 文件中没有有效数据');
                return;
            }

            // 2. 发送 JSON 数据到后端
            await importProductionPlan(parsedData);
            message.success(`成功导入 ${parsedData.length} 条生产计划`);
            await list(); // Refresh list
        } catch (error: any) {
            message.error(`导入失败: ${error.message || error.response?.data?.error || '未知错误'}`);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * 解析 Excel 文件为 JSON 数据（只提取最新日期的数据）
     */
    const parseExcelFile = async (file: File): Promise<Partial<ProductionPlan>[]> => {
        const workbook = new ExcelJS.Workbook();
        const arrayBuffer = await file.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0]; // 读取第一个工作表
        if (!worksheet) {
            throw new Error('Excel 文件中没有工作表');
        }

        const allPlans: Partial<ProductionPlan>[] = [];
        
        // 第一步：读取所有数据（假设第一行是表头，从第二行开始读取数据）
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // 跳过表头

            const rowValues = row.values as any[];
            
            // 根据你的 Excel 列顺序映射数据
            const plan: Partial<ProductionPlan> = {
                materialCode: rowValues[1]?.toString() || '',        // A列：物料编码
                partNumber: rowValues[2]?.toString() || '',          // B列：部品号
                type: rowValues[3]?.toString() || '',                // C列：直流/交流
                manufacturer: rowValues[4]?.toString() || '',        // D列：厂家
                planDate: parseDateFromExcel(rowValues[5]),          // E列：计划输入日期
                productionLine: rowValues[6]?.toString() || '',      // F列：生产线体
                
                tPlanned: parseNumberFromExcel(rowValues[7]),        // G列：T计划数
                tActual: parseNumberFromExcel(rowValues[8]),         // H列：T完成数
                tUnfinished: parseNumberFromExcel(rowValues[9]),     // I列：T未完成数
                
                t1Planned: parseNumberFromExcel(rowValues[10]),      // J列：T1计划数
                t1Actual: parseNumberFromExcel(rowValues[11]),       // K列：T1完成数
                t1Unfinished: parseNumberFromExcel(rowValues[12]),   // L列：T1未完成数
                
                t2Planned: parseNumberFromExcel(rowValues[13]),      // M列：T2计划数
                t2Actual: parseNumberFromExcel(rowValues[14]),       // N列：T2完成数
                t2Unfinished: parseNumberFromExcel(rowValues[15]),   // O列：T2未完成数
                
                t3Planned: parseNumberFromExcel(rowValues[16]),      // P列：T3计划数
                t3Actual: parseNumberFromExcel(rowValues[17]),       // Q列：T3完成数
                t3Unfinished: parseNumberFromExcel(rowValues[18]),   // R列：T3未完成数
                
                totalPlanned: parseNumberFromExcel(rowValues[19]),   // S列：计划数
                totalInspected: parseNumberFromExcel(rowValues[20]), // T列：检验数
                totalUnfinished: parseNumberFromExcel(rowValues[21]),// U列：未完成数
                achievementRate: parseNumberFromExcel(rowValues[22]),// V列：达成率
                specialNote: rowValues[23]?.toString() || '',        // W列：特殊物料备注
            };

            // 验证必填字段
            if (plan.materialCode && plan.partNumber && plan.planDate) {
                allPlans.push(plan);
            }
        });

        if (allPlans.length === 0) {
            throw new Error('Excel 文件中没有有效数据');
        }

        // 第二步：找到最新的日期
        const latestDate = findLatestDate(allPlans);
        
        // 第三步：只保留最新日期的数据
        const filteredPlans = allPlans.filter(plan => plan.planDate === latestDate);
        
        message.info(`已筛选最新日期 ${latestDate} 的数据，共 ${filteredPlans.length} 条`);
        
        return filteredPlans;
    };

    /**
     * 找到所有计划中最新的日期
     */
    const findLatestDate = (plans: Partial<ProductionPlan>[]): string => {
        if (plans.length === 0) return '';
        
        // 获取所有日期并排序
        const dates = plans
            .map(plan => plan.planDate)
            .filter(date => date && date !== '')
            .map(date => dayjs(date))
            .sort((a, b) => b.valueOf() - a.valueOf()); // 降序排列
        
        if (dates.length === 0) {
            throw new Error('Excel 文件中没有有效的日期数据');
        }
        
        // 返回最新日期（格式化为字符串）
        return dates[0].format('YYYY-MM-DD');
    };

    /**
     * 从 Excel 单元格解析日期
     */
    const parseDateFromExcel = (value: any): string => {
        if (!value) return '';
        
        // 如果是 Excel 日期序列号
        if (typeof value === 'number') {
            const date = new Date((value - 25569) * 86400 * 1000);
            return dayjs(date).format('YYYY-MM-DD');
        }
        
        // 如果是日期对象
        if (value instanceof Date) {
            return dayjs(value).format('YYYY-MM-DD');
        }
        
        // 如果是字符串
        if (typeof value === 'string') {
            return dayjs(value).format('YYYY-MM-DD');
        }
        
        return '';
    };

    /**
     * 从 Excel 单元格解析数字
     */
    const parseNumberFromExcel = (value: any): number => {
        if (value === null || value === undefined || value === '') return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    /**
     * 导出当前数据为 Excel 文件
     */
    const exportToExcel = async () => {
        if (!data.value || data.value.length === 0) {
            message.warning('没有数据可以导出');
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('生产计划');

            // 设置列宽
            worksheet.columns = [
                { width: 15 },  // A: 物料编码
                { width: 20 },  // B: 部品号
                { width: 12 },  // C: 直流/交流
                { width: 30 },  // D: 厂家
                { width: 15 },  // E: 计划输入日期
                { width: 15 },  // F: 生产线体
                { width: 12 },  // G: T计划数
                { width: 12 },  // H: T完成数
                { width: 12 },  // I: T未完成数
                { width: 12 },  // J: T1计划数
                { width: 12 },  // K: T1完成数
                { width: 12 },  // L: T1未完成数
                { width: 12 },  // M: T2计划数
                { width: 12 },  // N: T2完成数
                { width: 12 },  // O: T2未完成数
                { width: 12 },  // P: T3计划数
                { width: 12 },  // Q: T3完成数
                { width: 12 },  // R: T3未完成数
                { width: 12 },  // S: 计划数
                { width: 12 },  // T: 检验数
                { width: 12 },  // U: 未完成数
                { width: 12 },  // V: 达成率
                { width: 20 },  // W: 特殊物料备注
            ];

            // 添加表头
            const headerRow = worksheet.addRow([
                '物料编码',
                '部品号',
                '直流/交流',
                '厂家',
                '计划输入日期',
                '生产线体',
                'T计划数',
                'T完成数',
                'T未完成数',
                'T1计划数',
                'T1完成数',
                'T1未完成数',
                'T2计划数',
                'T2完成数',
                'T2未完成数',
                'T3计划数',
                'T3完成数',
                'T3未完成数',
                '计划数',
                '检验数',
                '未完成数',
                '达成率(%)',
                '特殊物料备注',
            ]);

            // 设置表头样式
            headerRow.height = 25;
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4472C4' }  // 蓝色背景
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            // 添加数据行
            data.value.forEach((plan: ProductionPlan) => {
                const row = worksheet.addRow([
                    plan.materialCode || '',
                    plan.partNumber || '',
                    plan.type || '',
                    plan.manufacturer || '',
                    plan.planDate ? dayjs(plan.planDate).format('YYYY-MM-DD') : '',
                    plan.productionLine || '',
                    plan.tPlanned || 0,
                    plan.tActual || 0,
                    plan.tUnfinished || 0,
                    plan.t1Planned || 0,
                    plan.t1Actual || 0,
                    plan.t1Unfinished || 0,
                    plan.t2Planned || 0,
                    plan.t2Actual || 0,
                    plan.t2Unfinished || 0,
                    plan.t3Planned || 0,
                    plan.t3Actual || 0,
                    plan.t3Unfinished || 0,
                    plan.totalPlanned || 0,
                    plan.totalInspected || 0,
                    plan.totalUnfinished || 0,
                    plan.achievementRate ? plan.achievementRate.toFixed(2) : '0.00',
                    plan.specialNote || '',
                ]);

                // 设置数据行样式
                row.height = 20;
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
                    };
                    
                    // 数字列右对齐
                    if (colNumber >= 7 && colNumber <= 22) {
                        cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    } else {
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    }

                    // 根据达成率设置颜色
                    if (colNumber === 22) { // 达成率列
                        const rate = parseFloat(cell.value as string);
                        if (rate >= 100) {
                            cell.font = { color: { argb: 'FF00B050' }, bold: true }; // 绿色
                        } else if (rate >= 80) {
                            cell.font = { color: { argb: 'FF4472C4' } }; // 蓝色
                        } else if (rate >= 50) {
                            cell.font = { color: { argb: 'FFFFC000' } }; // 橙色
                        } else {
                            cell.font = { color: { argb: 'FFC00000' }, bold: true }; // 红色
                        }
                    }
                });
            });

            // 冻结首行
            worksheet.views = [
                { state: 'frozen', xSplit: 0, ySplit: 1 }
            ];

            // 生成文件名（包含日期）
            const queryDate = selectedDate.value ? selectedDate.value.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
            const fileName = `生产计划_${queryDate}.xlsx`;

            // 导出文件
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            message.success(`导出成功：${fileName}，共 ${data.value.length} 条记录`);
        } catch (error: any) {
            console.error('导出错误:', error);
            message.error(`导出失败: ${error.message}`);
        }
    };

    return {
        isLoading,
        data,
        columns,
        pagination,
        searchKeyword,
        selectedDate,
        list,
        handleImport,
        exportToExcel,
    };
};
