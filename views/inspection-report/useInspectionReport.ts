import { ref } from 'vue';
import { message } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import ExcelJS from 'exceljs';
import { getInspectionReport, getProductLines } from '@/httpapis/management';

interface InspectionReportItem {
  productModelSN: string;
  batchNumber: string;
  inspectionCount: number;
  qualifiedCount: number;
  unqualifiedCount: number;
  supplierName: string;
  description?: string;
  productLine?: string;
  inspectionDate: string; // ISO date
}

interface InspectionReportQueryParams {
  pageNum: number | undefined;
  pageSize: number;
  productModelSN?: string;
  batchNumber?: string;
  supplierName?: string;
  productLineId?: number;
  startDate?: string;
  endDate?: string;
}

export const useInspectionReportData = () => {
  const isLoading = ref(false);
  const data = ref<InspectionReportItem[]>([]);
  const pagination = ref({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  // Filters
  const dateRange = ref<[Dayjs, Dayjs] | []>([]);
  const inputProductModelSN = ref<string>('');
  const inputBatchNumber = ref<string>('');
  const inputSupplierName = ref<string>('');
  const selectedProductLineId = ref<number | undefined>(undefined);
  const productLines = ref<any[]>([]);

  const columns = [
    { title: '供应商', dataIndex: 'supplierName', key: 'supplierName' },
    { title: '产品型号', dataIndex: 'description', key: 'description' },
    { title: '物料编码', dataIndex: 'productModelSN', key: 'productModelSN' },
    { title: '批次号', dataIndex: 'batchNumber', key: 'batchNumber' },
    { title: '产线', dataIndex: 'productLine', key: 'productLine' },
    { title: '检测总数', dataIndex: 'inspectionCount', key: 'inspectionCount' },
    { title: '合格数', dataIndex: 'qualifiedCount', key: 'qualifiedCount' },
    { title: '不合格数', dataIndex: 'unqualifiedCount', key: 'unqualifiedCount' },
    { title: '检验日期', dataIndex: 'inspectionDate', key: 'inspectionDate', customRender: ({ text }: { text: string }) => text ? dayjs(text).format('YYYY-MM-DD') : '' },
  ];

  const buildQuery = (exportAll = false): InspectionReportQueryParams => {
    const query: InspectionReportQueryParams = {
      pageNum: exportAll ? undefined : pagination.value.pageNum,
      pageSize: exportAll ? -1 : pagination.value.pageSize,
    };

    if (inputProductModelSN.value) query.productModelSN = inputProductModelSN.value.trim();
    if (inputBatchNumber.value) query.batchNumber = inputBatchNumber.value.trim();
    if (inputSupplierName.value) query.supplierName = inputSupplierName.value.trim();
    if (selectedProductLineId.value) {
      query.productLineId = selectedProductLineId.value;
    }

    if (dateRange.value && dateRange.value.length === 2) {
      query.startDate = dateRange.value[0].format('YYYY-MM-DD');
      query.endDate = dateRange.value[1].format('YYYY-MM-DD');
    }

    return query;
  };

  const list = async () => {
    isLoading.value = true;
    try {
      const response = await getInspectionReport(buildQuery());
      let responseData = response.data.data || [];

      // 如果后端没有按产品线筛选，前端进行临时筛选
      if (selectedProductLineId.value && responseData.length > 0) {
        // 获取选中产品线的名称
        const selectedLine = productLines.value.find(line => line.id === selectedProductLineId.value);
        if (selectedLine) {
          responseData = responseData.filter((item: InspectionReportItem) => item.productLine === selectedLine.name);
        }
      }

      data.value = responseData;
      pagination.value.total = response.data.pagination.total;
    } catch (error: any) {
      message.error(`获取全检报表失败: ${error.response?.data?.error || error.message}`);
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  };

  const resetFilters = () => {
    dateRange.value = [];
    inputProductModelSN.value = '';
    inputBatchNumber.value = '';
    inputSupplierName.value = '';
    selectedProductLineId.value = undefined;
    pagination.value.pageNum = 1;
  };

  const loadProductLines = async () => {
    try {
      const response = await getProductLines({ pageSize: 100 });
      productLines.value = response.data.data;
    } catch (error: any) {
      message.error(`加载产品线失败: ${error.response?.data?.error || error.message}`);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await getInspectionReport(buildQuery(true));
      const allData: InspectionReportItem[] = response.data.data || [];
      if (!allData.length) {
        message.warning('没有数据可以导出');
        return;
      }

      // Workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('全检报表');

      worksheet.columns = [
        { width: 20 }, // 物料编码
        { width: 15 }, // 批次号
        { width: 20 }, // 产品型号
        { width: 15 }, // 产线
        { width: 12 }, // 检验数量
        { width: 12 }, // 合格数
        { width: 12 }, // 不合格数
        { width: 25 }, // 供应商
        { width: 15 }, // 检验日期
      ];

      const totalCount = allData.reduce((sum, r) => sum + (r.inspectionCount || 0), 0);
      const qualifiedTotal = allData.reduce((sum, r) => sum + (r.qualifiedCount || 0), 0);
      const unqualifiedTotal = allData.reduce((sum, r) => sum + (r.unqualifiedCount || 0), 0);
      const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');

      worksheet.addRow(['检验总数:', `${totalCount}`, '', '', '', '', '', '']);
      worksheet.addRow(['合格/不合格:', `${qualifiedTotal} / ${unqualifiedTotal}`, '', '', '', '', '', '']);
      worksheet.addRow(['导出日期:', currentDate, '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '', '']);
      worksheet.addRow(['物料编码', '批次号', '产品型号', '产线', '检验数量', '合格数', '不合格数', '供应商', '检验日期']);

      allData.forEach(item => {
        worksheet.addRow([
          item.productModelSN || '',
          item.batchNumber || '',
          item.description || '',
          item.productLine || '',
          item.inspectionCount ?? 0,
          item.qualifiedCount ?? 0,
          item.unqualifiedCount ?? 0,
          item.supplierName || '',
          item.inspectionDate ? dayjs(item.inspectionDate).format('YYYY-MM-DD') : ''
        ]);
      });

      // Summary rows style (first 3 rows)
      for (let i = 1; i <= 3; i++) {
        const row = worksheet.getRow(i);
        row.height = 20;
        row.eachCell((cell, col) => {
          if (col <= 2) {
            cell.font = { bold: true, size: 12 };
            cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'right' : 'left' };
          }
        });
        worksheet.mergeCells(`B${i}:H${i}`);
      }

      // Header row style (row 5)
      const headerRow = worksheet.getRow(5);
      headerRow.height = 22;
      headerRow.eachCell(cell => {
        cell.font = { bold: true, size: 12 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      // Data rows style
      for (let i = 6; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        row.height = 18;
        row.eachCell(cell => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };
        });
      }

      const fileName = `全检报表_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    data,
    columns,
    pagination,
    dateRange,
    inputProductModelSN,
    inputBatchNumber,
    inputSupplierName,
    selectedProductLineId,
    productLines,
    list,
    resetFilters,
    exportToExcel,
    loadProductLines,
  };
};
