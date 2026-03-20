import { Router } from 'express';
import stackstoreController from '../controllers/stackstoreController';
import { wrapAttachAuth } from '../../../shared/middleware/authMiddleware';

const router = Router();
router.use(wrapAttachAuth);

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

export default router;
