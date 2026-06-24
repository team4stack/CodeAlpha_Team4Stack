import { Request, Response, NextFunction } from 'express';
import stackstoreService from '../services/stackstoreService';
import {
  submitSellerApplication,
  getMySellerApplication,
  listSellerApplications,
  reviewSellerApplication,
  getSellerByUserId,
} from '../services/sellerApplicationService';
import { STACKSTORE_ADMIN_ROLES, requireAdminRoles, requireUserJwt } from '../../../shared/middleware/authMiddleware';

function isStackstoreAdmin(req: Request): boolean {
  return req.auth?.kind === 'admin' && (STACKSTORE_ADMIN_ROLES as readonly string[]).includes(req.auth.role);
}

function handleServiceError(error: unknown, res: Response, next: NextFunction): void {
  const err = error as { status?: number; message?: string };
  if (err?.status) {
    res.status(err.status).json({ success: false, error: err.message || 'Request failed' });
    return;
  }
  next(error as Error);
}

export class StackStoreController {
  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { active, category_id, storefront, seller_id, verification_status } = req.query;
      const products = await stackstoreService.getProducts({
        ...(active !== undefined ? { active: active === 'true' } : {}),
        ...(category_id ? { category_id: category_id as string } : {}),
        ...(storefront === 'true' ? { storefront: true } : {}),
        ...(seller_id ? { seller_id: seller_id as string } : {}),
        ...(verification_status ? { verification_status: verification_status as string } : {}),
        ...(isStackstoreAdmin(req) ? { includeAll: true } : {}),
      });
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await stackstoreService.getProductById(id, {
        storefront: !isStackstoreAdmin(req) && req.query.storefront !== 'false',
      });
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const product = await stackstoreService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { id } = req.params;
      const product = await stackstoreService.updateProduct(id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  verifyProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { id } = req.params;
      const decision = req.body.decision === 'rejected' ? 'rejected' : 'approved';
      const product = await stackstoreService.verifyProduct(
        id,
        decision,
        req.body.rejection_reason ? String(req.body.rejection_reason) : undefined
      );
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { id } = req.params;
      await stackstoreService.deleteProduct(id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { active, includeInactive } = req.query;
      const categories = await stackstoreService.getCategories({
        ...(active !== undefined ? { active: active === 'true' } : {}),
        includeInactive: includeInactive === 'true' || isStackstoreAdmin(req),
      });
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const category = await stackstoreService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { id } = req.params;
      const category = await stackstoreService.updateCategory(id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { id } = req.params;
      await stackstoreService.deleteCategory(id);
      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { user_id, seller_id, status, payment_status, escrow_status } = req.query;
      const orders = await stackstoreService.getOrders({
        ...(user_id ? { user_id: user_id as string } : {}),
        ...(seller_id ? { seller_id: seller_id as string } : {}),
        ...(status ? { status: status as string } : {}),
        ...(payment_status ? { payment_status: payment_status as string } : {}),
        ...(escrow_status ? { escrow_status: escrow_status as string } : {}),
      });
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  };

  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const orders = await stackstoreService.getOrders({ user_id: req.auth.sub });
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  };

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Use checkout for purchases' });
      }
      const order = await stackstoreService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in to purchase projects' });
      }
      const productId = String(req.body.product_id || '').trim();
      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product is required' });
      }
      const order = await stackstoreService.createCheckoutOrder({
        userId: req.auth.sub,
        buyerEmail: req.auth.email,
        productId,
        buyerNote: req.body.buyer_note ? String(req.body.buyer_note).trim() : undefined,
      });
      res.status(201).json({
        success: true,
        data: order,
        message:
          'Order placed. Team4Stack will contact you for secure payment. Funds are held until delivery is confirmed.',
      });
    } catch (error) {
      handleServiceError(error, res, next);
    }
  };

  updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { id } = req.params;
      const order = await stackstoreService.updateOrder(id, req.body);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  getSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { active, includeInactive } = req.query;
      const sellers = await stackstoreService.getSellers({
        ...(active !== undefined ? { active: active === 'true' } : {}),
        includeInactive: includeInactive === 'true' || isStackstoreAdmin(req),
      });
      res.json({ success: true, data: sellers });
    } catch (error) {
      next(error);
    }
  };

  createSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const seller = await stackstoreService.createSeller(req.body);
      res.status(201).json({ success: true, data: seller });
    } catch (error) {
      next(error);
    }
  };

  updateSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { id } = req.params;
      const seller = await stackstoreService.updateSeller(id, req.body);
      res.json({ success: true, data: seller });
    } catch (error) {
      next(error);
    }
  };

  deleteSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const { id } = req.params;
      await stackstoreService.deleteSeller(id);
      res.json({ success: true, message: 'Seller deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  submitSellerApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.kind === 'user' ? req.auth.sub : null;
      const email = req.auth?.kind === 'user' ? req.auth.email : String(req.body.email || '');
      const application = await submitSellerApplication(userId, email, req.body);
      res.status(201).json({ success: true, data: application });
    } catch (error) {
      handleServiceError(error, res, next);
    }
  };

  getMySellerApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const application = await getMySellerApplication(req.auth.email);
      res.json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  };

  getMySellerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const seller = await getSellerByUserId(req.auth.sub);
      if (!seller) {
        return res.status(404).json({ success: false, error: 'Seller access not found' });
      }
      res.json({ success: true, data: seller });
    } catch (error) {
      next(error);
    }
  };

  getMySellerProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const seller = await getSellerByUserId(req.auth.sub);
      if (!seller) {
        return res.status(403).json({ success: false, error: 'Approved seller access required' });
      }
      const products = await stackstoreService.getProducts({ seller_id: seller.id });
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  createMySellerProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const seller = await getSellerByUserId(req.auth.sub);
      if (!seller) {
        return res.status(403).json({ success: false, error: 'Approved seller access required' });
      }
      const product = await stackstoreService.createSellerProduct(seller.id, req.body);
      res.status(201).json({
        success: true,
        data: product,
        message: 'Project submitted for Team4Stack verification.',
      });
    } catch (error) {
      handleServiceError(error, res, next);
    }
  };

  listSellerApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const applications = await listSellerApplications(status);
      res.json({ success: true, data: applications });
    } catch (error) {
      next(error);
    }
  };

  reviewSellerApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isStackstoreAdmin(req) || req.auth?.kind !== 'admin') {
        return res.status(403).json({ success: false, error: 'Stack Store admin access required' });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ success: false, error: 'Invalid application id' });
      }
      const decision = req.body.decision === 'rejected' ? 'rejected' : 'approved';
      const application = await reviewSellerApplication(
        id,
        decision,
        req.auth.email
      );
      res.json({ success: true, data: application });
    } catch (error) {
      handleServiceError(error, res, next);
    }
  };
}

export default new StackStoreController();
