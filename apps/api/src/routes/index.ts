import { Router } from 'express';
import { healthRouter } from '../modules/health/health.route';
import { authRouter } from '../modules/auth/auth.routes';
import { packageRouter } from '../modules/packages/package.routes';
import { destinationRouter } from '../modules/destinations/destination.routes';
import { categoryRouter } from '../modules/categories/category.routes';
import { tagRouter } from '../modules/tags/tag.routes';
import { faqRouter } from '../modules/faqs/faq.routes';
import { testimonialRouter } from '../modules/testimonials/testimonial.routes';
import { userRouter } from '../modules/users/user.routes';
import { notificationRouter } from '../modules/notifications/notification.routes';
import { settingRouter } from '../modules/settings/setting.routes';
import { hotelRouter } from '../modules/hotels/hotel.routes';
import { reviewRouter } from '../modules/reviews/review.routes';
import { postRouter } from '../modules/posts/post.routes';
import { bookingRouter } from '../modules/bookings/booking.routes';
import { paymentRouter } from '../modules/payments/payment.routes';
import { invoiceRouter } from '../modules/invoices/invoice.routes';
import { visaRouter } from '../modules/visa/visa.routes';
import { flightRouter } from '../modules/flights/flight.routes';
import { contactRouter } from '../modules/contact/contact.routes';
import { newsletterRouter } from '../modules/newsletter/newsletter.routes';
import { permissionRouter, roleRouter } from '../modules/rbac/rbac.routes';
import { auditRouter } from '../modules/audit/audit.routes';
import { analyticsRouter } from '../modules/analytics/analytics.routes';
import { mediaRouter } from '../modules/media/media.routes';
import { transportRouter } from '../modules/transport/transport.routes';

/**
 * Root API router (mounted at /api/v1). Domain module routers are registered
 * here as each backend module is added.
 */
export const apiRouter: Router = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/packages', packageRouter);
apiRouter.use('/destinations', destinationRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/tags', tagRouter);
apiRouter.use('/faqs', faqRouter);
apiRouter.use('/testimonials', testimonialRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/settings', settingRouter);
apiRouter.use('/hotels', hotelRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/invoices', invoiceRouter);
apiRouter.use('/visa', visaRouter);
apiRouter.use('/flights', flightRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/newsletter', newsletterRouter);
apiRouter.use('/roles', roleRouter);
apiRouter.use('/permissions', permissionRouter);
apiRouter.use('/activity-logs', auditRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/transport', transportRouter);

// Domain routers (bookings, payments, hotels, ...) mounted here by their modules.
