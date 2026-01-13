import { Request, Response, NextFunction } from 'express';
import stackstoreService from '../services/stackstoreService';

export class StackStoreController {
  // Products
  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { active, category_id } = req.query;
      const filters: any = {};
      if (active !== undefined) filters.active = active === 'true';
      if (category_id) filters.category_id = category_id as string;

      const products = await stackstoreService.getProducts(filters);
      res.json({ success: true, data: products });
    } catch (error: any) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await stackstoreService.getProductById(id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (error: any) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await stackstoreService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await stackstoreService.updateProduct(id, req.body);
      res.json({ success: true, data: product });
    } catch (error: any) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await stackstoreService.deleteProduct(id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Categories
  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await stackstoreService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await stackstoreService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const category = await stackstoreService.updateCategory(id, req.body);
      res.json({ success: true, data: category });
    } catch (error: any) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await stackstoreService.deleteCategory(id);
      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Orders
  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, status, payment_status } = req.query;
      const filters: any = {};
      if (user_id) filters.user_id = user_id as string;
      if (status) filters.status = status as string;
      if (payment_status) filters.payment_status = payment_status as string;

      const orders = await stackstoreService.getOrders(filters);
      res.json({ success: true, data: orders });
    } catch (error: any) {
      next(error);
    }
  };

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await stackstoreService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      next(error);
    }
  };

  updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await stackstoreService.updateOrder(id, req.body);
      res.json({ success: true, data: order });
    } catch (error: any) {
      next(error);
    }
  };

  // Sellers
  getSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellers = await stackstoreService.getSellers();
      res.json({ success: true, data: sellers });
    } catch (error: any) {
      next(error);
    }
  };

  createSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const seller = await stackstoreService.createSeller(req.body);
      res.status(201).json({ success: true, data: seller });
    } catch (error: any) {
      next(error);
    }
  };

  updateSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const seller = await stackstoreService.updateSeller(id, req.body);
      res.json({ success: true, data: seller });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new StackStoreController();
