export { ProductCatalog } from './components/ProductCatalog';
export { ProductGrid } from './components/ProductGrid';
export { ProductCard } from './components/ProductCard';
export { ProductDetailPage } from './components/ProductDetailPage';
export { ProductImageGallery } from './components/ProductImageGallery';
export { ProductInfo } from './components/ProductInfo';

export { useProducts } from './hooks/useProducts';
export { useProductDetail } from './hooks/useProductDetail';
export { productService } from './services/productService';

export type {
    Product,
    ProductImage,
    Category,
    ProductListResponse,
    CategoryListResponse,
    ProductFilters,
} from './types/product';
