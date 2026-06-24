import { Router } from 'express';
import stackstoreController from '../controllers/stackstoreController';
import {
  wrapAttachAuth,
  requireUserJwt,
  requireAdminRoles,
  STACKSTORE_ADMIN_ROLES,
} from '../../../shared/middleware/authMiddleware';

const router = Router();
router.use(wrapAttachAuth);

const stackAdmin = requireAdminRoles(STACKSTORE_ADMIN_ROLES);

// Seller applications (user)
router.post('/applications', requireUserJwt, stackstoreController.submitSellerApplication);
router.get('/applications/me', requireUserJwt, stackstoreController.getMySellerApplication);

// Seller portal (approved sellers)
router.get('/seller/me', requireUserJwt, stackstoreController.getMySellerProfile);
router.get('/seller/products', requireUserJwt, stackstoreController.getMySellerProducts);
router.post('/seller/products', requireUserJwt, stackstoreController.createMySellerProduct);

// Buyer checkout
router.post('/checkout', requireUserJwt, stackstoreController.checkout);
router.get('/orders/me', requireUserJwt, stackstoreController.getMyOrders);

// Admin: seller applications + product verification
router.get('/admin/applications', stackAdmin, stackstoreController.listSellerApplications);
router.post('/admin/applications/:id/review', stackAdmin, stackstoreController.reviewSellerApplication);
router.post('/admin/products/:id/verify', stackAdmin, stackstoreController.verifyProduct);

// Products
router.get('/products', stackstoreController.getProducts);
router.get('/products/:id', stackstoreController.getProductById);
router.post('/products', stackstoreController.createProduct);
router.put('/products/:id', stackstoreController.updateProduct);
router.delete('/products/:id', stackstoreController.deleteProduct);

// Categories
router.get('/categories', stackstoreController.getCategories);
router.post('/categories', stackstoreController.createCategory);
router.put('/categories/:id', stackstoreController.updateCategory);
router.delete('/categories/:id', stackstoreController.deleteCategory);

// Orders
router.get('/orders', stackstoreController.getOrders);
router.post('/orders', stackstoreController.createOrder);
router.put('/orders/:id', stackstoreController.updateOrder);

// Sellers
router.get('/sellers', stackstoreController.getSellers);
router.post('/sellers', stackstoreController.createSeller);
router.put('/sellers/:id', stackstoreController.updateSeller);
router.delete('/sellers/:id', stackstoreController.deleteSeller);

export default router;
