export interface User {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  role?: UserRole;
}

export type UserRole = "admin" | "user";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  age?: number;
  city?: string;
  skills: string[];
  isActive: boolean;
}

export interface UsersParams {
  name?: string;
  city?: string;
  skill?: string;
  minAge?: string;
  maxAge?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalUsers: number;
    totalPages: number;
  };
}

export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string | null;
}

export interface MongoProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  brand: string;
  tags: string[];
  stock: number;
}

export interface ProductFilterParams {
  name?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  brand?: string;
  tag?: string;
  sort?: "" | "price" | "-price";
}

export interface ProductFilterResponse {
  count: number;
  products: MongoProduct[];
}

export interface ProductsResponse {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  products: Product[];
}

export interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface ProductPayload {
  name: string;
  category: string;
  price: string;
  description: string;
  image?: File | null;
}

export interface StudentSubject {
  subjectName: string;
  grade: number;
}

export interface Student {
  _id: string;
  name: string;
  group: string;
  subjects: StudentSubject[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentsResponse {
  count: number;
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  limit: number;
  students: Student[];
}

export interface StudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  group?: string;
}

export interface StudentPayload {
  name: string;
  group: string;
  subjects: StudentSubject[];
}

export interface TopStudentResult {
  id: string;
  name: string;
  group: string;
  average: number;
}

export interface TopStudentsResponse {
  count: number;
  results: TopStudentResult[];
}
