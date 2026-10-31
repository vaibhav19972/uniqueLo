import React, { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '../../stores/auth';
import { Button } from '../ui/Button';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useToastStore } from '../../stores/toast';

/**
 * Signed-in account panel: identity, saved addresses, order history link, sign out.
 * Address management lives here because the checkout drawer only *selects* one.
 */
export const AccountDrawer: React.FC = () => {
  const user = useAuthStore((s) => s.user);
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
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <button
        aria-label="Close account panel"
        onClick={closeDrawer}
        className="absolute inset-0 bg-panel-raised/40 backdrop-blur-[2px] cursor-default"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative h-full w-full sm:max-w-[420px] bg-paper border-l border-stone overflow-y-auto focus:outline-none animate-in slide-in-from-right duration-300"
      >
        <div className="sticky top-0 bg-paper border-b border-stone px-5 py-4 flex items-center justify-between z-10">
          <h2 id="account-title" className="text-xs uppercase tracking-eyebrow text-ink font-medium">
            {adding ? 'Add address' : 'Your account'}
          </h2>
          <button
            onClick={() => (adding ? setAdding(false) : closeDrawer())}
            aria-label={adding ? 'Back' : 'Close'}
            className="p-2 -mr-2 text-ink-muted hover:text-ink transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

            {adding ? (
              <form onSubmit={handleSave} className="p-5 space-y-3.5">
                {(
                  [
                    ['recipient_name', 'Full name', 'name', 'text'],
                    ['phone', 'Phone', 'tel', 'tel'],
                    ['address_line', 'Address', 'street-address', 'text'],
                    ['landmark', 'Landmark (optional)', 'off', 'text'],
                    ['city', 'City', 'address-level2', 'text'],
                    ['state', 'State', 'address-level1', 'text'],
                    ['pincode', 'Pincode', 'postal-code', 'text'],
                  ] as const
                ).map(([key, label, ac, type]) => (
                  <div key={key}>
                    <label htmlFor={`addr-${key}`} className="block text-xs uppercase tracking-label text-ink-muted mb-1">
                      {label}
                    </label>
                    <input
                      id={`addr-${key}`}
                      type={type}
                      inputMode={key === 'pincode' || key === 'phone' ? 'numeric' : undefined}
                      autoComplete={ac}
                      required={key !== 'landmark'}
                      maxLength={key === 'pincode' ? 6 : undefined}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 bg-paper border border-stone text-sm text-ink focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                ))}
                {error && !error.isMailerLimit && (
                  <p role="alert" className="text-xs text-error">
                    {error.message}
                  </p>
                )}
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Save address
                </Button>
              </form>
            ) : (
              <div className="p-5 space-y-6">
                <div>
                  <p className="font-serif text-xl text-ink">{displayName}</p>
                  <p className="text-sm text-ink-muted mt-0.5">{user.email}</p>
                </div>

                <div className="divide-y divide-stone border-y border-stone">
                  <Link
                    to="/orders"
                    onClick={closeDrawer}
                    className="flex items-center justify-between py-3.5 text-sm text-ink hover:text-accent transition-colors"
                  >
                    <span>Order history</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/track-order"
                    onClick={closeDrawer}
                    className="flex items-center justify-between py-3.5 text-sm text-ink hover:text-accent transition-colors"
                  >
                    <span>Track an order</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-eyebrow text-ink-muted">
                      Saved addresses {addresses.length > 0 && `(${addresses.length})`}
                    </h3>
                    <button
                      onClick={() => setAdding(true)}
                      className="text-xs uppercase tracking-label text-accent hover:text-accent-hover transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="text-sm text-ink-muted leading-relaxed">
                      No saved addresses yet. Add one to check out in fewer steps.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {addresses.map((a) => (
                        <li key={a.id} className="border border-stone p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm text-ink font-medium flex items-center gap-2">
                                {a.recipient_name}
                                {a.is_default && (
                                  <span className="text-xs uppercase tracking-widest text-accent border border-accent/40 px-1.5 py-0.5">
                                    Default
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-ink-muted leading-relaxed mt-1">
                                {a.address_line}
                                {a.landmark ? `, ${a.landmark}` : ''}<br />
                                {a.city}, {a.state} {a.pincode}
                                <br />
                                {a.phone}
                              </p>
                            </div>
                            <button
                              onClick={() => void deleteAddress(a.id)}
                              aria-label={`Delete address for ${a.recipient_name}`}
                              className="p-2 -m-1 text-ink-muted hover:text-error transition-colors cursor-pointer shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  onClick={() => {
                    void signOut();
                    showToast({ title: 'Signed out', type: 'info' });
                  }}
                  className="w-full text-left text-sm text-ink-muted hover:text-error transition-colors py-2 cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
  );
};
