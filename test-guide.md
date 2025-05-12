# Testing Guide for New Features

## 1. Related Products Feature

### Testing Steps:
1. Navigate to a product detail page (e.g., `/product/[some-product-slug]`)
2. Scroll down to the bottom of the page
3. Verify that related products from the same collection are displayed
4. Verify that the current product is not shown in the related products section
5. Click on one of the related products to ensure navigation works properly

### Expected Results:
- Related products section should display up to 8 products from the same collection
- Current product should not be displayed in the related products section
- Each product card should display correctly with image, name, and price
- Clicking a related product should navigate to its detail page

## 2. Review Functionality

### Testing Steps:
1. Navigate to a product detail page
2. Scroll down to find the "Write a Review" button
3. Click the "Write a Review" button
4. If not logged in, verify you're redirected to the login page
5. After logging in, submit a review with rating and comment
6. Verify the review appears in the product reviews section

### Expected Results:
- Review dialog should open when "Write a Review" is clicked
- Non-logged in users should be redirected to login
- After submitting a review, it should appear in the reviews list
- A user should not be able to review the same product twice

## 3. Combo Products Feature

### Testing Steps:
1. Navigate to `/combos` to see the combos page
2. Verify that collection-based combo products are displayed
3. Click on a combo collection
4. Verify that products within that collection are displayed on the combo detail page

### Expected Results:
- Combo page should display available collection-based combos
- Clicking on a combo should navigate to its detail page
- Combo detail page should show products from the selected collection

## API Testing:

### Related Products API:
- Test endpoint: `GET /api/product/get-products-by-collection/:collectionId`
- Expected response: JSON array of products in the same collection

### Product Reviews API:
- Test add review: `POST /api/reviews/add-review` (requires authentication)
- Test get reviews: `GET /api/reviews/product-reviews/:productId`
- Expected responses: Successful creation of review / retrieval of product reviews
