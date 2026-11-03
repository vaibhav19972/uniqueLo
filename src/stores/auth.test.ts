import { describe, expect, it, beforeEach } from 'vitest';
import { useAuthStore } from './auth';
import { useWishlistStore } from './wishlist';
import type { User } from '@supabase/supabase-js';

const mockUser: User = {
  id: 'usr_test_999',
  email: 'hypebeast@uniquelo.in',
  app_metadata: {},
  user_metadata: { full_name: 'Aarav Sharma' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
};

describe('useAuthStore — Modal vs Account Drawer routing and collision prevention', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      status: 'idle',
      error: null,
      addresses: [],
      isAdmin: false,
      isOpen: false,
      mode: 'signin',
      isAccountDrawerOpen: false,
    });
    useWishlistStore.setState({
      isOpen: false,
      savedSlugs: [],
    });
  });

  describe('Logged-out state (user: null)', () => {
    it('opens sign-in auth modal when requested', () => {
      useAuthStore.getState().openModal('signin');

      const state = useAuthStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.mode).toBe('signin');
      expect(state.isAccountDrawerOpen).toBe(false);
    });

    it('opens sign-up auth modal when requested', () => {
      useAuthStore.getState().openModal('signup');

      const state = useAuthStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.mode).toBe('signup');
      expect(state.isAccountDrawerOpen).toBe(false);
    });

    it('closes auth modal cleanly', () => {
      useAuthStore.getState().openModal('signin');
      expect(useAuthStore.getState().isOpen).toBe(true);

      useAuthStore.getState().closeModal();
      expect(useAuthStore.getState().isOpen).toBe(false);
    });
  });

  describe('Logged-in state (user authenticated)', () => {
    it('PREVENTS signup/signin dialog and redirects to account drawer on openModal()', () => {
      // Simulate active authenticated user session
      useAuthStore.setState({ user: mockUser });

      // Calling openModal('signin') or openModal('signup') must NOT show auth modal
      useAuthStore.getState().openModal('signin');

      const state = useAuthStore.getState();
      // Auth modal dialog must stay CLOSED
      expect(state.isOpen).toBe(false);
      // Account drawer must be OPEN
      expect(state.isAccountDrawerOpen).toBe(true);
    });

    it('PREVENTS signup modal when user is logged in', () => {
      useAuthStore.setState({ user: mockUser });

      useAuthStore.getState().openModal('signup');

      const state = useAuthStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.isAccountDrawerOpen).toBe(true);
    });

    it('openAccountDrawer() opens account drawer and guarantees auth dialog is closed', () => {
      useAuthStore.setState({ user: mockUser, isOpen: true });

      useAuthStore.getState().openAccountDrawer();

      const state = useAuthStore.getState();
      expect(state.isAccountDrawerOpen).toBe(true);
      expect(state.isOpen).toBe(false);
    });

    it('closeAccountDrawer() closes the account drawer', () => {
      useAuthStore.setState({ user: mockUser, isAccountDrawerOpen: true });

      useAuthStore.getState().closeAccountDrawer();

      expect(useAuthStore.getState().isAccountDrawerOpen).toBe(false);
    });
  });

  describe('Drawer collisions & isolation arbitration', () => {
    it('closes wishlist drawer when account drawer is opened', () => {
      useWishlistStore.setState({ isOpen: true });
      expect(useWishlistStore.getState().isOpen).toBe(true);

      useAuthStore.getState().openAccountDrawer();

      expect(useAuthStore.getState().isAccountDrawerOpen).toBe(true);
      expect(useWishlistStore.getState().isOpen).toBe(false);
    });

    it('closes wishlist drawer when openModal() redirects to account drawer', () => {
      useAuthStore.setState({ user: mockUser });
      useWishlistStore.setState({ isOpen: true });

      useAuthStore.getState().openModal('signin');

      expect(useAuthStore.getState().isAccountDrawerOpen).toBe(true);
      expect(useAuthStore.getState().isOpen).toBe(false);
      expect(useWishlistStore.getState().isOpen).toBe(false);
    });
  });

  describe('Sign-out state cleanup', () => {
    it('closes account drawer and auth modal on signOut()', async () => {
      useAuthStore.setState({
        user: mockUser,
        isAccountDrawerOpen: true,
        isOpen: true,
      });

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.isAccountDrawerOpen).toBe(false);
      expect(state.isOpen).toBe(false);
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.addresses).toEqual([]);
    });
  });
});
