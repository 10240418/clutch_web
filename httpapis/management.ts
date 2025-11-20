import axiosInstance from './index';
import { Api } from '@/model/managementModels';

// Dashboard APIs
export const getDashboardStats = (query: object) => {
    return axiosInstance.get('/management/quality_stats', { params: query });
};

// Supplier APIs
export const addSupplier = (data: object) => {
    return axiosInstance.post('/management/supplier', data);
};

export const deleteSupplier = (ids: number[]) => {
    return axiosInstance.delete('/management/supplier', { data: { ids } });
};

export const getSuppliers = (query?: object) => {
    return axiosInstance.get('/management/supplier', { params: query });
};

export const getSupplier = (id: number) => {
    return axiosInstance.get(`/management/supplier/${id}`);
};

export const updateSupplier = (data: object) => {
    return axiosInstance.put('/management/supplier', data);
};

// Product Model APIs
export const addProductModel = (data: object) => {
    return axiosInstance.post('/management/product_model', data);
};

export const deleteProductModel = (ids: number[]) => {
    return axiosInstance.delete('/management/product_model', { data: { ids } });
};

export const getProductModels = (query?: object) => {
    return axiosInstance.get('/management/product_model', { params: query });
};

export const getProductModel = (id: number) => {
    return axiosInstance.get(`/management/product_model/${id}`);
};

export const updateProductModel = (data: object) => {
    return axiosInstance.put('/management/product_model', data);
};

// Production Plan APIs
export const addProductionPlan = (data: object) => {
    return axiosInstance.post('/management/production_plan', data);
};

export const deleteProductionPlan = (ids: number[]) => {
    return axiosInstance.delete('/management/production_plan', { data: { ids } });
};

export const getProductionPlans = (query?: object) => {
    return axiosInstance.get('/management/production_plan', { params: query });
};

export const getProductionPlan = (id: number) => {
    return axiosInstance.get(`/management/production_plan/${id}`);
};

export const updateProductionPlan = (data: object) => {
    return axiosInstance.put('/management/production_plan', data);
};

export const getProductionPlansByDateRange = (date: string) => {
    return axiosInstance.get('/management/production_plan/date_range', { params: { date } });
};

export const importProductionPlan = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/management/production_plan/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// Product Line APIs (Management)
export const addProductLine = (data: object) => {
    return axiosInstance.post('/management/product_line', data);
};

export const deleteProductLine = (ids: number[]) => {
    return axiosInstance.delete('/management/product_line', { data: { ids } });
};

export const getProductLines = (query?: object) => {
    return axiosInstance.get('/management/product_line', { params: query });
};

export const getProductLine = (id: number) => {
    return axiosInstance.get(`/management/product_line/${id}`);
};

// Pallet APIs (Management)
export const getPallets = (query?: object) => {
    return axiosInstance.get('/management/pallet', { params: query });
};

export const getPallet = (id: number) => {
    return axiosInstance.get(`/management/pallet/${id}`);
};

// Product APIs (Management)
export const getProducts = (query?: object) => {
    return axiosInstance.get('/management/product', { params: query });
};

export const getProduct = (id: number) => {
    return axiosInstance.get(`/management/product/${id}`);
};

// API Management
export const addApi = (data: Api) => {
    return axiosInstance.post('/management/api', data);
};

export const deleteApi = (ids: number[]) => {
    return axiosInstance.delete('/management/api', { data: { ids } });
};

export const getApis = (query?: object) => {
    return axiosInstance.get('/management/api', { params: query });
};

export const getApi = (id: number) => {
    return axiosInstance.get(`/management/api/${id}`);
};

export const updateApi = (data: object) => {
    return axiosInstance.put('/management/api', data);
};

// User Management
export const addUser = (data: object) => {
    return axiosInstance.post('/management/user', data);
};

export const deleteUser = (ids: number[]) => {
    return axiosInstance.delete('/management/user', { data: { ids } });
};

export const getUsers = (query?: object) => {
    return axiosInstance.get('/management/user', { params: query });
};

export const getUser = (id: number) => {
    return axiosInstance.get(`/management/user/${id}`);
};

export const updateUser = (data: object) => {
    return axiosInstance.put('/management/user', data);
};

export const login = (data: { username: string; password: string }) => {
    return axiosInstance.post('/management/login', data);
}

// Defect Report APIs
export const getDefectReport = (query?: object) => {
    return axiosInstance.get('/management/report/defect', { params: query });
};

// Inspection Report APIs
export const getInspectionReport = (query?: object) => {
    return axiosInstance.get('/management/report/inspection', { params: query });
};

// Cost Report APIs
export const getCostReport = (query?: object) => {
    return axiosInstance.get('/management/report/cost', { params: query });
};
