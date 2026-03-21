/**
 * Utility for GTM Data Layer pushes (ecommerce events)
 */

export const pushToDataLayer = (event, data = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...data
  });
};

export const trackViewItemList = (products) => {
  pushToDataLayer('view_item_list', {
    ecommerce: {
      item_list_name: 'Main Page',
      items: products.map((p, index) => ({
        item_id: p.sku,
        item_name: p.nombre,
        item_category: p.categoria,
        price: p.precio,
        index: index + 1
      }))
    }
  });
};

export const trackViewItem = (product) => {
  pushToDataLayer('view_item', {
    ecommerce: {
      items: [{
        item_id: product.sku,
        item_name: product.nombre,
        item_category: product.categoria,
        price: product.precio
      }]
    }
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  pushToDataLayer('add_to_cart', {
    ecommerce: {
      items: [{
        item_id: product.sku,
        item_name: product.nombre,
        item_category: product.categoria,
        price: product.precio,
        quantity: quantity
      }]
    }
  });
};

export const trackRemoveFromCart = (product) => {
  pushToDataLayer('remove_from_cart', {
    ecommerce: {
      items: [{
        item_id: product.sku,
        item_name: product.nombre,
        item_category: product.categoria,
        price: product.precio,
        quantity: product.quantity || 1
      }]
    }
  });
};

export const trackBeginCheckout = (cart, total) => {
  pushToDataLayer('begin_checkout', {
    ecommerce: {
      value: total,
      currency: 'COP',
      items: cart.map(item => ({
        item_id: item.sku,
        item_name: item.nombre,
        item_category: item.categoria,
        price: item.precio,
        quantity: item.quantity
      }))
    }
  });
};

export const trackPurchase = (transactionId, cart, total, shipping) => {
  pushToDataLayer('purchase', {
    ecommerce: {
      transaction_id: transactionId,
      value: total + shipping,
      tax: 0,
      shipping: shipping,
      currency: 'COP',
      items: cart.map(item => ({
        item_id: item.sku,
        item_name: item.nombre,
        item_category: item.categoria,
        price: item.precio,
        quantity: item.quantity
      }))
    }
  });
};

export const trackVIPProfile = (label) => {
  pushToDataLayer('vip_scoring_assigned', {
    user_properties: {
      customer_profile_ai: label
    }
  });
};
