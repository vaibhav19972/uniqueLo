import React, { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '../../stores/auth';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useToastStore } from '../../stores/toast';

/**
 * Signed-in account panel — Streetwear D2C Revamp
 *
 * Clean white ground, profile header, order history shortcut,
 * saved shipping addresses, and sign-out action.
 */
export const AccountDrawer: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const addresses = useAuthStore((s) => s.addresses);
  const signOut = useAuthStore((s) => s.signOut);
  const saveAddress = useAuthStore((s) => s.saveAddress);
  const deleteAddress = useAuthStore((s) => s.deleteAddress);
  const error = useAuthStore((s) => s.error);
  const showToast = useToastStore((s) => s.showToast);

  const isOpen = useAuthStore((s) => s.isAccountDrawerOpen);
  const closeDrawer = useAuthStore((s) => s.closeAccountDrawer);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    recipient_name: '',
    phone: '',
    address_line: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  const dialogRef = useDialogFocus<HTMLDivElement>(
    isOpen,
    useCallback(() => {
      setAdding(false);
      closeDrawer();
    }, [closeDrawer]),
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (adding) {
          setAdding(false);
        } else {
          closeDrawer();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, adding, closeDrawer]);

  if (!isOpen || !user) return null;

  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.trim() || user.email?.split('@')[0] || 'Customer';

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(form.pincode)) {
      showToast({ title: 'Check the pincode', description: 'Enter a 6-digit Indian pincode.', type: 'info' });
      return;
    }
    const ok = await saveAddress({
      ...form,
      label: null,
      landmark: form.landmark || null,
      is_default: addresses.length === 0,
    });
    if (ok) {
      setAdding(false);
      setForm({ recipient_name: '', phone: '', address_line: '', landmark: '', city: '', state: '', pincode: '' });
      showToast({ title: 'Address saved', type: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 z-[320] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="account-title">
      {/* Backdrop */}
      <button
        aria-label="Close account panel"
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-default transition-opacity"
      />

      {/* Drawer */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 flex h-full w-full sm:max-w-[420px] flex-col bg-white text-neutral-900 shadow-2xl overflow-y-auto focus:outline-none"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
              ACCOUNT
            </span>
            <h2 id="account-title" className="font-display text-sm font-black uppercase tracking-tight text-neutral-900">
              {adding ? 'Add Shipping Address' : 'Your Account'}
            </h2>
          </div>
          <button
            onClick={() => (adding ? setAdding(false) : closeDrawer())}
            aria-label={adding ? 'Back' : 'Close'}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-black transition-colors"
          >
            {adding ? (
              <span className="text-xs font-bold text-black uppercase">← Back</span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {adding ? (
          <form onSubmit={handleSave} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
            {(
              [
                ['recipient_name', 'Full name', 'name', 'text', 'Recipient full name'],
                ['phone', 'Phone Number', 'tel', 'tel', '10-digit mobile number'],
                ['address_line', 'Street Address / Flat', 'street-address', 'text', 'House / Flat no., street'],
                ['landmark', 'Landmark (optional)', 'off', 'text', 'Nearby landmark'],
                ['city', 'City', 'address-level2', 'text', 'e.g. Mumbai'],
                ['state', 'State', 'address-level1', 'text', 'e.g. Maharashtra'],
                ['pincode', 'Pincode', 'postal-code', 'text', '6-digit PIN code'],
              ] as const
            ).map(([key, label, ac, type, ph]) => (
              <div key={key}>
                <label htmlFor={`addr-${key}`} className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  {label}
                </label>
                <input
                  id={`addr-${key}`}
                  type={type}
                  inputMode={key === 'pincode' || key === 'phone' ? 'numeric' : undefined}
                  autoComplete={ac}
                  placeholder={ph}
                  required={key !== 'landmark'}
                  maxLength={key === 'pincode' ? 6 : undefined}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            ))}
            {error && !error.isMailerLimit && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                {error.message}
              </p>
            )}
            <div className="pt-2">
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-black text-xs font-black uppercase tracking-wider text-white shadow-xs transition hover:bg-neutral-800 active:scale-[0.99]"
              >
                Save Shipping Address →
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 space-y-6 flex-1 overflow-y-auto">
            {/* User Profile Card */}
            <div className="flex items-center gap-3.5 rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-2xs">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-sm font-black text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-sm font-black uppercase tracking-tight text-neutral-900">
                    {displayName}
                  </p>
                  <span className="rounded bg-neutral-200 px-1.5 py-0.2 text-[9px] font-black uppercase text-neutral-700">
                    INSIDER
                  </span>
                </div>
                <p className="truncate text-xs text-neutral-500">{user.email}</p>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 overflow-hidden shadow-2xs">
              <Link
                to="/orders"
                onClick={closeDrawer}
                className="flex items-center justify-between px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📦</span>
                  <span>Order History &amp; Tracking</span>
                </div>
                <span className="text-neutral-400">→</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeDrawer}
                  className="flex items-center justify-between px-4 py-3.5 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">⚡</span>
                    <span>Admin Catalog Studio</span>
                  </div>
                  <span>→</span>
                </Link>
              )}
            </div>

            {/* Saved Shipping Addresses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  Saved Addresses {addresses.length > 0 && `(${addresses.length})`}
                </h3>
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="rounded-md bg-neutral-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-neutral-900 hover:bg-neutral-200 transition-colors"
                >
                  + Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300 p-5 text-center">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    No saved addresses yet. Save an address for 1-tap checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-black underline underline-offset-2 hover:text-red-600"
                  >
                    Add your first address →
                  </button>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {addresses.map((a) => (
                    <li key={a.id} className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 shadow-2xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black uppercase tracking-tight text-neutral-900">
                              {a.recipient_name}
                            </p>
                            {a.is_default && (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-black uppercase text-emerald-800">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                            {a.address_line}
                            {a.landmark ? `, ${a.landmark}` : ''}<br />
                            {a.city}, {a.state} – <span className="font-mono font-bold">{a.pincode}</span><br />
                            <span className="text-neutral-500 font-mono">📱 {a.phone}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void deleteAddress(a.id)}
                          aria-label={`Delete address for ${a.recipient_name}`}
                          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-neutral-400 hover:bg-neutral-200 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sign Out */}
            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  closeDrawer();
                  showToast({ title: 'Signed out', type: 'info' });
                }}
                className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-neutral-300 text-xs font-black uppercase tracking-wider text-neutral-700 hover:border-red-600 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
