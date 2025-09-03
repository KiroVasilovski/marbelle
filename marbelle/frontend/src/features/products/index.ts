export { ProductCatalog } from './components/ProductCatalog';
export { ProductGrid } from './components/ProductGrid';
export { ProductCard } from './components/ProductCard';

export { useProducts } from './hooks/useProducts';
export { productService } from './services/productService';

export type {
    Product,
    ProductImage,
    Category,
    ProductListResponse,
    CategoryListResponse,
    ProductFilters,
} from './types/product';