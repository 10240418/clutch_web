// Management Models
export enum SupplierType {
  OEM = '直接供应',
  ODM = '贸易商',
}

export interface Supplier {
  id?: number;
  name: string;
  sap: string;
  type: SupplierType;
}

export interface ProductModel {
  id?: number;
  sap: string;
  sn: string;
  description: string;
  supplierId: number | undefined;
  supplier?: Supplier; // 用于关联显示
}

export interface ProductionPlan {
  id: number;
  materialCode: string;
  partNumber: string;
  type: string;
  manufacturer: string;
  planDate: string;
  productionLine: string;

  tPlanned: number;
  tActual: number;
  tUnfinished: number;

  t1Planned: number;
  t1Actual: number;
  t1Unfinished: number;

  t2Planned: number;
  t2Actual: number;
  t2Unfinished: number;
  t3Planned: number;
  t3Actual: number;
  t3Unfinished: number;
  totalPlanned: number;
  totalInspected: number;
  totalUnfinished: number;
  achievementRate: number;
  specialNote: string;
}

export interface ProductLine {
  id?: number;
  name: string;
  palletSnPrefix: string;
  deviceId: string;
  isRegistered?: boolean;
  publicKey?: string;
}

export interface Pallet {
  id?: number;
  sn: string;
  productModelId: number | undefined;
  productModel?: ProductModel; // 用于关联显示
  productLineId: number | undefined;
  productLine?: ProductLine; // 用于关联显示
  goal: number; // 目标数量
  createdAt: string; // ISO 日期字符串
}

export interface Product {
  id?: number;
  sn: string;
  productModelId: number | undefined;
  productModel?: ProductModel; // 用于关联显示
  productLineId: number | undefined;
  productLine?: ProductLine; // 用于关联显示
  productionPlanId: number | undefined;
  productionPlan?: ProductionPlan; // 用于关联显示
  palletId: number | undefined;
  pallet?: Pallet; // 用于关联显示
  hasDefect: boolean; // 是否有缺陷
  defectReason?: string; // 缺陷原因
  createdAt: string; // ISO 日期字符串
}

export interface User {
  id?: number;
  username: string;
  email: string;
  mobile: string;
  password?: string; // 仅用于创建/编辑用户，不会在API响应中返回
  active: boolean;
  createdAt?: string; // ISO 日期字符串
  updatedAt?: string; // ISO 日期字符串
  deletedAt?: string | null; // ISO 日期字符串或null
}

export interface Api {
  id?: number;
  name: string;
  appId: string;
  secret?: string; // 仅用于创建/编辑API，不会在API响应中返回
}

export interface LoginModel {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface PaginationParams {
  pageNum: number;
  pageSize: number;
  keyword?: string;
}

export interface PaginationResult {
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination: PaginationResult;
  message?: string;
}