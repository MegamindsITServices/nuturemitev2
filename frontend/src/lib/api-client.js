import config from '../config/environment';

// Get backend URL from environment config
export const backendURL = config.getApiUrl();

export const AUTH_ROUTE = 'api/auth';
export const PRODUCT_ROUTE = 'api/product';
export const COLLECTION_ROUTE = 'api/collections';
export const ORDER_ROUTE = 'api/order';
export const BLOG_ROUTE = 'api/blog';
export const BANNER_ROUTE = "api/banners";
export const CART_ROUTE = "api/cart";
export const REVIEW_ROUTE = "api/reviews";

// Auth endpoints
export const SIGNUP_ROUTE = `${AUTH_ROUTE}/signup`
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`
export const USER_INFO = `${AUTH_ROUTE}/user-info`
export const ADMIN_PROTECTED = `${AUTH_ROUTE}/admin-auth`
export const LOGOUT = `${AUTH_ROUTE}/logout`
export const AUTH_PROFILE = `${AUTH_ROUTE}/profile`
export const ADD_ADMIN = `${AUTH_ROUTE}/add-admin`
export const GET_ADMINS = `${AUTH_ROUTE}/get-admins`
export const UPDATE_ADMIN = `${AUTH_ROUTE}/update-admin`

// Product endpoints
export const ADD_PRODUCT = `${PRODUCT_ROUTE}/add-product`
export const GET_PRODUCTS = `${PRODUCT_ROUTE}/get-products`
export const GET_PRODUCT_BY_ID = `${PRODUCT_ROUTE}/get-product-by-id/:id`
export const GET_PRODUCT_BY_SLUG = `${PRODUCT_ROUTE}/get-product/:slug`
export const GET_PRODUCT_BY_COLLECTION = `${PRODUCT_ROUTE}/get-product-by-collection`
export const GET_PRODUCT_BY_SEARCH = `${PRODUCT_ROUTE}/get-product-by-search`
export const GET_PRODUCT_BY_PRICE = `${PRODUCT_ROUTE}/get-product-by-price`
export const GET_PRODUCT_BY_RATING = `${PRODUCT_ROUTE}/get-product-by-rating`
export const GET_PRODUCT_BY_SORT = `${PRODUCT_ROUTE}/get-product-by-sort`
export const UPDATE_PRODUCT = `${PRODUCT_ROUTE}/update-product/:id`
export const DELETE_PRODUCT = `${PRODUCT_ROUTE}/delete-product/:id`
export const GET_PRODUCTS_BY_COLLECTION = `${PRODUCT_ROUTE}/get-products-by-collection`


// Collection endpoints
export const ADD_COLLECTION = `${COLLECTION_ROUTE}/add-collection`
export const GET_COLLECTION = `${COLLECTION_ROUTE}/get-collection`
export const GET_COLLECTION_BY_ID = `${COLLECTION_ROUTE}/get-collection/:id`
export const UPDATE_COLLECTION = `${COLLECTION_ROUTE}/update-collection/:id`
export const DELETE_COLLECTION = `${COLLECTION_ROUTE}/delete-collection/:id`

// Blog endpoints
export const GET_BLOGS = `${BLOG_ROUTE}/get-blog`
export const GET_BLOG_BY_SLUG = `${BLOG_ROUTE}/get-blog/:slug`
export const ADD_BLOG = `${BLOG_ROUTE}/add-blog`
export const UPDATE_BLOG = `${BLOG_ROUTE}/update-blog/:id`
export const DELETE_BLOG = `${BLOG_ROUTE}/delete-blog/:id`
export const GET_BLOG_BY_ID = `${BLOG_ROUTE}/get-blog/:id`

// Order endpoints
export const ADD_ORDER = `${ORDER_ROUTE}/add-order`
export const GET_ORDER = `${ORDER_ROUTE}/get-all-orders`
export const GET_ORDER_BY_ID = `${ORDER_ROUTE}/get-order/:id`
export const UPDATE_ORDER = `${ORDER_ROUTE}/update-order/:id`
export const DELETE_ORDER = `${ORDER_ROUTE}/delete-order/:id`
export const GET_ORDER_BY_USER = `${ORDER_ROUTE}/get-order-by-user/:userId`
export const GET_ORDER_BY_DATE = `${ORDER_ROUTE}/get-order-by-date/:date`

// Banner endpoints
export const ADD_BANNER = `${BANNER_ROUTE}/add-banner`
export const GET_BANNER = `${BANNER_ROUTE}/get-banner`
export const GET_BANNER_BY_ID = `${BANNER_ROUTE}/get-banner/:id`
export const UPDATE_BANNER = `${BANNER_ROUTE}/update-banner/:id`
export const DELETE_BANNER = `${BANNER_ROUTE}/delete-banner/:id`

// Cart endpoints
export const ADD_TO_CART = `${CART_ROUTE}/add-cart`
export const GET_CART = `${CART_ROUTE}/get-cart`
export const REMOVE_FROM_CART = `${CART_ROUTE}/remove-cart`;

// Review endpoints
export const ADD_REVIEW = `${REVIEW_ROUTE}/add-review`;
export const GET_PRODUCT_REVIEWS = `${REVIEW_ROUTE}/product-reviews/:productId`;
export const UPDATE_REVIEW = `${REVIEW_ROUTE}/update-review/:reviewId`;
export const DELETE_REVIEW = `${REVIEW_ROUTE}/delete-review/:reviewId`;