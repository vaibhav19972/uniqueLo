import { useEffect, useRef } from 'react';
import { useCartStore } from '../stores/cart';
import { useToastStore } from '../stores/toast';
import { useProducts } from './useCatalog';
import { findUnavailableCartItems } from '../lib/data';

/**
 * Reconcile the persisted bag against the catalogue that is actually live.
 *
 * The bag survives in `localStorage` across deploys — and across origins, so a
 * cart filled on localhost and a cart filled on production are different objects
 * with different lifetimes. The catalogue does not survive with it. When a line
 * outlives the variant it names, `quote_order` refuses the ENTIRE bag with
 * `P0002 Unknown or uncatalogued variant SKU`, and because `getCartLine` returns
 * null for the same line every visible list filters it out. The result is the
 * worst possible state: a bag that looks normal, a red server error, a dead pay
 * button, and no visible line to delete.
 *
 * So the bag prunes itself. Dropping an unpurchasable line is strictly better
 * than blocking the sale — but it must be SAID, not done silently, or the
 * customer discovers the change at the total. The toast names the count and the
 * removal is one bulk write, so several stale lines produce one message.
 *
 * Runs before the quote: `useQuote` reads the store, so a prune re-keys the
 * quote query and re-prices against a bag the server will accept.
 */
export function useReconcileCart(): void {
  const items = useCartStore((s) => s.items);
  const removeItems = useCartStore((s) => s.removeItems);
  const showToast = useToastStore((s) => s.showToast);
  const { data: products } = useProducts();

  // A stale line is removed once. The ref guards against a second pass while the
  // store write and the catalogue query settle, which would re-toast the same
  // finding before `items` reflects the removal.
  const reconciled = useRef(false);

  useEffect(() => {
    // No catalogue yet is not the same as no products. `findUnavailableCartItems`
    // returns [] for an empty list, so an unloaded or failed fetch can never
    // empty a valid bag.
    if (!products || products.length === 0) return;
    if (items.length === 0) {
      reconciled.current = false;
      return;
    }
    if (reconciled.current) return;

    const stale = findUnavailableCartItems(items, products);
    if (stale.length === 0) {
      reconciled.current = true;
      return;
    }

    reconciled.current = true;
    removeItems(stale.map((i) => i.id));

    showToast({
      title:
        stale.length === 1
          ? 'One item is no longer available'
          : `${stale.length} items are no longer available`,
      description: 'We removed them from your bag. The rest of your order is unchanged.',
      type: 'info',
    });
  }, [items, products, removeItems, showToast]);
}
