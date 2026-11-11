
export interface ShopifyFetchOptions<
  TVariables = Record<string, unknown>
> {
  query: string;
  variables?: TVariables;
  cache?: RequestCache;
  tags?: string[];
  buyerIp?: string;
}

export interface ShopifyGraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface ShopifyGraphQLResponse<TData> {
  data?: TData | null;
  errors?: ShopifyGraphQLError[];
}

export interface ShopifyMenuItem {
  id: string;
  title: string;
  url: string;
  type: string;
  items: ShopifyMenuItem[];
}

export interface ShopifyMenu {
  id: string;
  title: string;
  handle: string;
  items: ShopifyMenuItem[];
}

export interface GetMenuQueryVariables {
  handle: string;
}

export interface GetMenuQueryResponse {
  menu: ShopifyMenu | null;
}

export interface ShopifyImage {
  id?: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyPriceRange {
  minVariantPrice: ShopifyMoney;
  maxVariantPrice: ShopifyMoney;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  priceRange: ShopifyPriceRange;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  images?: {
    nodes: ShopifyImage[];
  };
  variants?: {
    nodes: ShopifyProductVariant[];
  };
  options?: {
    name: string;
    values: string[];
  }[];
}

export interface ShopifyProductEdge {
  cursor: string;
  node: ShopifyProduct;
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface ShopifyProductsQueryVariables {
  first: number;
  after?: string | null;
  sortKey?: string;
  reverse?: boolean;
}

export interface ShopifyProductsQueryResponse {
  products: {
    edges: ShopifyProductEdge[];
    pageInfo: ShopifyPageInfo;
  };
}

export interface ShopifyProductQueryVariables {
  handle: string;
}

export interface ShopifyProductQueryResponse {
  product: ShopifyProduct | null;
}

export interface GetProductsOptions {
  first?: number;
  after?: string | null;
  sortKey?: string;
  reverse?: boolean;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
}

export interface ShopifyCollectionProduct extends ShopifyProduct {
  featuredImage: ShopifyImage | null;
}

export interface ShopifyCollectionEdge {
  cursor: string;
  node: ShopifyCollection;
}

export interface ShopifyCollectionsQueryVariables {
  first: number;
  after?: string | null;
  sortKey?: string;
  reverse?: boolean;
}

export interface ShopifyCollectionsQueryResponse {
  collections: {
    edges: Array<{
      cursor: string;
      node: ShopifyCollection & {
        products: {
          nodes: ShopifyProduct[];
        };
      };
    }>;
    pageInfo: ShopifyPageInfo;
  };
}

export interface ShopifyCollectionQueryVariables {
  handle: string;
  first: number;
  after?: string | null;
  sortKey?: string;
  reverse?: boolean;
}

export interface ShopifyCollectionQueryResponse {
  collection: (ShopifyCollection & {
    products: {
      edges: ShopifyProductEdge[];
      pageInfo: ShopifyPageInfo;
    };
  }) | null;
}

export interface GetCollectionsOptions {
  first?: number;
  after?: string | null;
  sortKey?: string;
  reverse?: boolean;
}

export interface GetCollectionOptions {
  handle: string;
  first?: number;
  after?: string | null;
  sortKey?: string;
  reverse?: boolean;
}

export interface ShopifyPageSEO {
  title: string | null;
  description: string | null;
}

export interface ShopifyPage {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  createdAt: string;
  updatedAt: string;
  seo: ShopifyPageSEO;
}

export interface ShopifyPagesQueryVariables {
  first: number;
  after?: string | null;
}

export interface ShopifyPagesQueryResponse {
  pages: {
    edges: Array<{
      cursor: string;
      node: ShopifyPage;
    }>;
    pageInfo: ShopifyPageInfo;
  };
}

export interface ShopifyPageQueryVariables {
  handle: string;
}

export interface ShopifyPageQueryResponse {
  page: ShopifyPage | null;
}

export interface GetPagesOptions {
  first?: number;
  after?: string | null;
}

export interface ShopifyAuthor {
  name: string;
  firstName?: string;
  lastName?: string;
}

export interface ShopifySEO {
  title: string | null;
  description: string | null;
}

export interface ShopifyBlog {
  id: string;
  title: string;
  handle: string;
  seo?: ShopifySEO | null;
}

export interface ShopifyArticle {
  id: string;
  title: string;
  handle: string;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  authorV2: ShopifyAuthor | null;
  image: ShopifyImage | null;
  seo: ShopifySEO | null;
}

export interface ShopifyBlogsQueryVariables {
  first: number;
  after?: string | null;
}

export interface ShopifyBlogsQueryResponse {
  blogs: {
    edges: Array<{
      cursor: string;
      node: ShopifyBlog;
    }>;
    pageInfo: ShopifyPageInfo;
  };
}

export interface ShopifyBlogQueryVariables {
  handle: string;
}

export interface ShopifyBlogQueryResponse {
  blog: ShopifyBlog | null;
}

export interface ShopifyArticlesQueryVariables {
  blogHandle: string;
  first: number;
  after?: string | null;
}

export interface ShopifyArticlesQueryResponse {
  blog: (ShopifyBlog & {
    articles: {
      edges: Array<{
        cursor: string;
        node: ShopifyArticle;
      }>;
      pageInfo: ShopifyPageInfo;
    };
  }) | null;
}

export interface ShopifyArticleQueryVariables {
  blogHandle: string;
  articleHandle: string;
}

export interface ShopifyArticleQueryResponse {
  blog: {
    articleByHandle: ShopifyArticle | null;
  } | null;
}

export interface GetBlogsOptions {
  first?: number;
  after?: string | null;
}

export interface GetArticlesOptions {
  blogHandle: string;
  first?: number;
  after?: string | null;
}

export interface ShopifyMetaobjectImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyMetaobjectReference {
  id?: string;
  handle?: string;
  title?: string;
  image?: ShopifyMetaobjectImage | null;
}

export interface ShopifyMetaobjectField {
  key: string;
  type: string;
  value: string | null;
  reference?: ShopifyMetaobjectReference | null;
}

export interface ShopifyMetaobject {
  id: string;
  type: string;
  handle: string;
  fields: ShopifyMetaobjectField[];
  updatedAt?: string;
}

export interface ShopifyMetaobjectsQueryVariables {
  type: string;
  first: number;
  after?: string | null;
}

export interface ShopifyMetaobjectsQueryResponse {
  metaobjects: {
    edges: Array<{
      cursor: string;
      node: ShopifyMetaobject;
    }>;
    pageInfo: ShopifyPageInfo;
  };
}

export interface ShopifyMetaobjectQueryVariables {
  handle: {
    type: string;
    handle: string;
  };
}

export interface ShopifyMetaobjectQueryResponse {
  metaobject: ShopifyMetaobject | null;
}

export interface ShopifyMetafield {
  id: string;
  namespace: string;
  key: string;
  type: string;
  value: string;
  reference?: ShopifyMetaobjectReference | null;
}

export interface ShopifyMetafieldsQueryVariables {
  handle: string;
  identifiers: Array<{
    namespace: string;
    key: string;
  }>;
}

export interface ShopifyProductMetafieldsQueryResponse {
  product: {
    id: string;
    handle: string;
    title: string;
    metafields: Array<ShopifyMetafield | null>;
  } | null;
}

export interface ShopifyCollectionMetafieldsQueryResponse {
  collection: {
    id: string;
    handle: string;
    title: string;
    metafields: Array<ShopifyMetafield | null>;
  } | null;
}

export interface GetMetaobjectsOptions {
  type: string;
  first?: number;
  after?: string | null;
}

export interface GetMetaobjectOptions {
  type: string;
  handle: string;
}

export interface GetMetafieldsOptions {
  handle: string;
  identifiers: Array<{
    namespace: string;
    key: string;
  }>;
}

export interface ShopifyCartUserError {
  field: string[] | null;
  message: string;
}

export interface ShopifyCartMutationResponse {
  cart: ShopifyCart | null;
  userErrors: ShopifyCartUserError[];
}

export interface ShopifyCartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface ShopifyCartLineUpdateInput {
  id: string;
  quantity?: number;
  merchandiseId?: string;
}

export interface ShopifyCartMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyCartCost {
  subtotalAmount: ShopifyCartMoney;
  totalAmount: ShopifyCartMoney;
  totalTaxAmount: ShopifyCartMoney | null;
}

export interface ShopifyCartLineCost {
  amountPerQuantity: ShopifyCartMoney;
  compareAtAmountPerQuantity: ShopifyCartMoney | null;
  subtotalAmount: ShopifyCartMoney;
  totalAmount: ShopifyCartMoney;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
    price: ShopifyCartMoney;
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
  };
  cost: ShopifyCartLineCost;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  createdAt?: string;
  updatedAt?: string;
  cost?: ShopifyCartCost;
  lines?: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

export interface ShopifyCartQueryVariables {
  cartId: string;
}

export interface ShopifyCartQueryResponse {
  cart: ShopifyCart | null;
}

export interface ShopifyCreateCartQueryVariables {
  input: {
    lines?: ShopifyCartLineInput[];
  };
}

export interface ShopifyCartLinesQueryVariables {
  cartId: string;
  lines: ShopifyCartLineInput[];
}

export interface ShopifyCartUpdateQueryVariables {
  cartId: string;
  lines: ShopifyCartLineUpdateInput[];
}

export interface ShopifyCartRemoveQueryVariables {
  cartId: string;
  lineIds: string[];
}

export interface GetCartMutationResponse {
  cartCreate?: ShopifyCartMutationResponse;
  cartLinesAdd?: ShopifyCartMutationResponse;
  cartLinesUpdate?: ShopifyCartMutationResponse;
  cartLinesRemove?: ShopifyCartMutationResponse;
}

export interface CreateCartOptions {
  lines?: ShopifyCartLineInput[];
}
