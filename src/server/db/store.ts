import crypto from 'crypto';
import {
  User,
  Category,
  Product,
  Cart,
  Order,
  OrderStatus,
  InventoryEvent,
  WebhookEventRecord,
  ALLOWED_ORDER_TRANSITIONS,
} from '../../shared/types.js';

interface SessionData {
  userId: string;
  createdAt: number;
  expiresAt: number;
  csrfToken: string;
}

export class ShopEaseDataStore {
  public users: Map<string, User & { passwordHash: string; salt: string }> = new Map();
  public categories: Map<string, Category> = new Map();
  public products: Map<string, Product> = new Map();
  public carts: Map<string, Cart> = new Map(); // key: userId
  public orders: Map<string, Order> = new Map();
  public inventoryEvents: InventoryEvent[] = [];
  public webhookEvents: Map<string, WebhookEventRecord> = new Map(); // key: `${provider}:${eventId}`
  public sessions: Map<string, SessionData> = new Map();

  constructor() {
    this.seedInitialData();
  }

  // Password hashing helper using standard crypto PBKDF2 with SHA-512
  public hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const s = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, s, 100000, 64, 'sha512').toString('hex');
    return { hash, salt: s };
  }

  public verifyPassword(password: string, hash: string, salt: string): boolean {
    const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  }

  private seedInitialData() {
    // 1. Seed Categories
    const categoriesData: Category[] = [
      {
        id: 'cat_home',
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Sculpted furniture, architectural lighting, and natural interior objects.',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat_leather',
        name: 'Leather Goods',
        slug: 'leather-goods',
        description: 'Handcrafted full-grain leather bags, wallets, and travel essentials.',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat_coffee',
        name: 'Artisanal Coffee',
        slug: 'coffee-gear',
        description: 'Minimalist pour-over brewers, carafes, and ceramic tableware.',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat_timepieces',
        name: 'Timepieces',
        slug: 'timepieces',
        description: 'Brushed titanium chronographs and mechanical wristwatches.',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat_apparel',
        name: 'Essentials Apparel',
        slug: 'apparel',
        description: 'Heavyweight organic cotton staples made for timeless utility.',
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const cat of categoriesData) {
      this.categories.set(cat.id, cat);
    }

    // 2. Seed Users
    // Admin: admin@shopease.store / AdminPass123!
    const adminHash = this.hashPassword('AdminPass123!');
    const adminUser: User & { passwordHash: string; salt: string } = {
      id: 'usr_admin_01',
      name: 'Elena Rostova',
      email: 'admin@shopease.store',
      role: 'admin',
      passwordHash: adminHash.hash,
      salt: adminHash.salt,
      createdAt: new Date().toISOString(),
    };
    this.users.set(adminUser.id, adminUser);

    // Customer: alex@example.com / CustomerPass123!
    const custHash = this.hashPassword('CustomerPass123!');
    const customerUser: User & { passwordHash: string; salt: string } = {
      id: 'usr_customer_01',
      name: 'Alex Vance',
      email: 'alex@example.com',
      role: 'customer',
      passwordHash: custHash.hash,
      salt: custHash.salt,
      createdAt: new Date().toISOString(),
    };
    this.users.set(customerUser.id, customerUser);

    // 3. Seed Products with our generated assets
    const productsData: Product[] = [
      {
        id: 'prd_oak_lounge_chair',
        name: 'Scandinavian Sculpted Oak Lounge Chair',
        slug: 'scandinavian-sculpted-oak-lounge-chair',
        description:
          'Meticulously steam-bent solid white oak frame with hand-woven paper cord seat. Finished in an ultra-matte Danish soap finish that ages gracefully.',
        categoryId: 'cat_home',
        categoryName: 'Home & Living',
        priceMinor: 48000, // $480.00
        currency: 'USD',
        stock: 8,
        active: true,
        imageUrl: '/src/assets/images/hero_editorial_showcase_1792056508649.jpg',
        imageAlt: 'Scandinavian oak lounge chair in sunlit living room',
        features: ['Solid European white oak', 'Hand-woven paper cord', 'Weight capacity: 150kg', 'Pre-assembled'],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prd_leather_weekender',
        name: 'Full-Grain Cognac Leather Weekender',
        slug: 'full-grain-cognac-leather-weekender',
        description:
          'Vegetable-tanned full-grain cowhide with heavy gauge solid brass YKK zippers. Includes a detachable padded shoulder strap and waterproof shoe compartment.',
        categoryId: 'cat_leather',
        categoryName: 'Leather Goods',
        priceMinor: 29500, // $295.00
        currency: 'USD',
        stock: 14,
        active: true,
        imageUrl: '/src/assets/images/product_leather_weekender_1792056509125.jpg',
        imageAlt: 'Cognac leather weekender bag resting on travertine plinth',
        features: ['Full-grain vegetable-tanned leather', 'Solid brushed brass hardware', '48L capacity', 'TSA carry-on compliant'],
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prd_ceramic_pourover_set',
        name: 'Matte Stone Ceramic Pour-Over Dripper Set',
        slug: 'matte-stone-ceramic-pourover-set',
        description:
          'Double-fired matte stoneware dripper cone paired with a heat-resistant borosilicate glass server. Designed with 60-degree internal ribbing for optimal extraction.',
        categoryId: 'cat_coffee',
        categoryName: 'Artisanal Coffee',
        priceMinor: 6800, // $68.00
        currency: 'USD',
        stock: 22,
        active: true,
        imageUrl: '/src/assets/images/product_ceramic_pourover_1792056508760.jpg',
        imageAlt: 'Artisanal ceramic pour-over dripper and server on marble table',
        features: ['Stoneware ceramic body', '600ml borosilicate glass carafe', 'Standard #02 cone filters', 'Dishwasher safe'],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prd_titanium_chronograph',
        name: 'Brushed Titanium Automatic Chronograph',
        slug: 'brushed-titanium-automatic-chronograph',
        description:
          'Grade-5 aerospace titanium casing with charcoal sunburst dial, anti-reflective sapphire crystal, and Japanese automatic chronograph movement with 42-hour reserve.',
        categoryId: 'cat_timepieces',
        categoryName: 'Timepieces',
        priceMinor: 64000, // $640.00
        currency: 'USD',
        stock: 6,
        active: true,
        imageUrl: '/src/assets/images/product_chronograph_watch_1792056508599.jpg',
        imageAlt: 'Minimalist brushed titanium chronograph watch on black slate',
        features: ['Grade-5 titanium 40mm case', 'Anti-reflective sapphire crystal', '100m water resistance', '42h power reserve'],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prd_heavyweight_crewneck',
        name: 'Organic Heavyweight French Terry Crewneck',
        slug: 'organic-heavyweight-french-terry-crewneck',
        description:
          'Crafted from 480 GSM combed organic cotton in a structured relaxed fit. Garment dyed with natural mineral pigments and pre-shrunk for lifelong fit.',
        categoryId: 'cat_apparel',
        categoryName: 'Essentials Apparel',
        priceMinor: 8500, // $85.00
        currency: 'USD',
        stock: 19,
        active: true,
        imageUrl: '/src/assets/images/product_organic_cotton_crew_1792058297030.jpg',
        imageAlt: 'Folded heavyweight organic cotton crewneck sweatshirt on linen',
        features: ['480 GSM French Terry', '100% GOTS organic cotton', 'Ribbed cuffs & hem', 'Preshrunk fabric'],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prd_brass_floor_lamp',
        name: 'Architectural Spun Brass Arc Floor Lamp',
        slug: 'architectural-spun-brass-arc-floor-lamp',
        description:
          'Sweeping cantilevered arch made from spun solid brass with mouth-blown satin opaline glass globe. Produces a warm 2700K ambient glow with integrated rotary dimmer.',
        categoryId: 'cat_home',
        categoryName: 'Home & Living',
        priceMinor: 22000, // $220.00
        currency: 'USD',
        stock: 5,
        active: true,
        imageUrl: '/src/assets/images/product_spun_brass_lamp_1792058296121.jpg',
        imageAlt: 'Architectural brass arc floor lamp with glowing opaline globe',
        features: ['Solid brushed brass', 'Mouth-blown opal glass globe', 'Integrated smooth rotary dimmer', 'Heavy marble weighted base'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prd_leather_card_wallet',
        name: 'Italian Vegetable-Tanned Saddle Card Wallet',
        slug: 'italian-vegetable-tanned-saddle-card-wallet',
        description:
          'Hand-cut from 4oz Italian Buttero saddle leather. Features hand-waxed linen thread stitching, beveled and burnished edges, and four precision card slots.',
        categoryId: 'cat_leather',
        categoryName: 'Leather Goods',
        priceMinor: 5800, // $58.00
        currency: 'USD',
        stock: 24,
        active: true,
        imageUrl: '/src/assets/images/product_leather_card_wallet_1792058297900.jpg',
        imageAlt: 'Vegetable-tanned leather cardholder on travertine stone',
        features: ['Buttero Italian vegetable-tanned leather', 'Hand-stitched linen thread', '4 card slots + cash pocket', 'Patina develops over time'],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prd_ceramic_espresso_cups',
        name: 'Handcrafted Speckled Ceramic Tasting Cups (Pair)',
        slug: 'handcrafted-speckled-ceramic-tasting-cups',
        description:
          'Wheel-thrown stoneware espresso tasting cups finished in an unglazed raw exterior and silky speckled interior glaze. Tactile ergonomics for espresso extraction.',
        categoryId: 'cat_coffee',
        categoryName: 'Artisanal Coffee',
        priceMinor: 3800, // $38.00
        currency: 'USD',
        stock: 18,
        active: true,
        imageUrl: '/src/assets/images/product_ceramic_espresso_cups_1792058297613.jpg',
        imageAlt: 'Pair of handcrafted ceramic espresso tasting cups on dark basalt',
        features: ['Wheel-thrown stoneware', '120ml tasting volume', 'Dishwasher & microwave safe', 'Hand-stamped studio mark'],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const prd of productsData) {
      this.products.set(prd.id, prd);
      // Record seed inventory event
      this.inventoryEvents.push({
        id: `inv_seed_${prd.id}`,
        productId: prd.id,
        productName: prd.name,
        change: prd.stock,
        reason: 'INITIAL_SEED',
        stockBefore: 0,
        stockAfter: prd.stock,
        actorId: 'system',
        actorEmail: 'system@shopease.internal',
        note: 'Initial catalog stocking baseline',
        createdAt: prd.createdAt,
      });
    }

    // 4. Seed initial cart for demo customer Alex
    this.carts.set('usr_customer_01', {
      userId: 'usr_customer_01',
      items: [
        {
          productId: 'prd_ceramic_pourover_set',
          quantity: 1,
        },
      ],
      updatedAt: new Date().toISOString(),
    });

    // 5. Seed a completed order for Alex so order history is immediately visible
    const initialOrder: Order = {
      id: 'ord_demo_9821',
      orderNumber: 'SE-98210',
      userId: 'usr_customer_01',
      items: [
        {
          productId: 'prd_leather_weekender',
          name: 'Full-Grain Cognac Leather Weekender',
          unitPriceMinor: 29500,
          quantity: 1,
          subtotalMinor: 29500,
          imageUrl: '/src/assets/images/product_leather_weekender_1792056509125.jpg',
        },
      ],
      subtotalMinor: 29500,
      shippingMinor: 0,
      taxMinor: 2360,
      totalMinor: 31860,
      currency: 'USD',
      deliveryDetails: {
        fullName: 'Alex Vance',
        email: 'alex@example.com',
        phone: '+1 (555) 234-5678',
        addressLine1: '742 Evergreen Terrace',
        city: 'Portland',
        postalCode: '97201',
        country: 'United States',
      },
      orderStatus: 'PROCESSING',
      paymentMethod: 'Hosted Sandbox Card',
      paymentProviderReference: 'ch_sbx_98210a_verified',
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      statusHistory: [
        {
          status: 'PENDING_PAYMENT',
          changedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          changedBy: 'system',
          note: 'Order initiated via checkout intent',
        },
        {
          status: 'PAID',
          changedAt: new Date(Date.now() - 86400000 * 2 + 30000).toISOString(),
          changedBy: 'payment_webhook',
          note: 'Verified hosted sandbox signature',
        },
        {
          status: 'PROCESSING',
          changedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          changedBy: 'admin@shopease.store',
          note: 'Allocated to fulfillment queue',
        },
      ],
    };
    this.orders.set(initialOrder.id, initialOrder);
  }

  // --- ATOMIC INVENTORY & CHECKOUT LOGIC ---
  /**
   * Concurrency-safe atomic stock reservation.
   * Checks current stock for all items; if all sufficient, decrements atomically.
   * If any item is out of stock, throws error and leaves stock untouched.
   */
  public atomicReserveStock(
    items: Array<{ productId: string; quantity: number }>,
    orderId: string,
    actorId: string,
    actorEmail: string
  ): { success: boolean; snapshots: Array<Product & { reservedQty: number }> } {
    // 1. Pre-check all items atomically
    const snapshots: Array<Product & { reservedQty: number }> = [];

    for (const item of items) {
      const product = this.products.get(item.productId);
      if (!product || !product.active) {
        throw new Error(`Product ${item.productId} is unavailable or discontinued.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`
        );
      }
      snapshots.push({ ...product, reservedQty: item.quantity });
    }

    // 2. Commit atomic stock decrement
    const now = new Date().toISOString();
    for (const snap of snapshots) {
      const current = this.products.get(snap.id)!;
      const stockBefore = current.stock;
      current.stock -= snap.reservedQty;
      current.updatedAt = now;
      this.products.set(current.id, current);

      // Audit log event
      this.inventoryEvents.push({
        id: `inv_res_${crypto.randomUUID().slice(0, 8)}`,
        productId: current.id,
        productName: current.name,
        orderId,
        change: -snap.reservedQty,
        reason: 'CHECKOUT_RESERVATION',
        stockBefore,
        stockAfter: current.stock,
        actorId,
        actorEmail,
        note: `Stock reserved for Order #${orderId}`,
        createdAt: now,
      });
    }

    return { success: true, snapshots };
  }

  /**
   * Release reserved stock on order cancellation or payment failure
   */
  public releaseStock(orderId: string, actorId: string, actorEmail: string, reasonNote?: string): void {
    const order = this.orders.get(orderId);
    if (!order) return;

    const now = new Date().toISOString();
    for (const item of order.items) {
      const product = this.products.get(item.productId);
      if (product) {
        const stockBefore = product.stock;
        product.stock += item.quantity;
        product.updatedAt = now;
        this.products.set(product.id, product);

        this.inventoryEvents.push({
          id: `inv_rel_${crypto.randomUUID().slice(0, 8)}`,
          productId: product.id,
          productName: product.name,
          orderId,
          change: item.quantity,
          reason: 'ORDER_CANCELLED_RELEASE',
          stockBefore,
          stockAfter: product.stock,
          actorId,
          actorEmail,
          note: reasonNote || `Stock released on order cancellation/refund #${orderId}`,
          createdAt: now,
        });
      }
    }
  }

  /**
   * Manual admin stock adjustment with required actor & reason
   */
  public adminAdjustStock(
    productId: string,
    delta: number,
    reason: 'ADMIN_MANUAL_ADJUST' | 'ADMIN_RESTOCK',
    actorId: string,
    actorEmail: string,
    note?: string
  ): Product {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found.');

    const newStock = product.stock + delta;
    if (newStock < 0) {
      throw new Error(`Cannot adjust stock below zero. Current stock is ${product.stock}.`);
    }

    const stockBefore = product.stock;
    product.stock = newStock;
    product.updatedAt = new Date().toISOString();
    this.products.set(product.id, product);

    this.inventoryEvents.push({
      id: `inv_adj_${crypto.randomUUID().slice(0, 8)}`,
      productId: product.id,
      productName: product.name,
      change: delta,
      reason,
      stockBefore,
      stockAfter: newStock,
      actorId,
      actorEmail,
      note: note || `Manual adjustment by admin (${delta > 0 ? '+' : ''}${delta})`,
      createdAt: new Date().toISOString(),
    });

    return product;
  }
}

// Global Singleton Instance
export const store = new ShopEaseDataStore();
