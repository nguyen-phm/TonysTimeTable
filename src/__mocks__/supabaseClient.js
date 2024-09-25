export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockResolvedValue({ data: [], error: null }), // mocking successful fetch
    insert: jest.fn().mockResolvedValue({ data: [], error: null }), // mocking insert action
    // more methods go here if we need them for tests
  })),
  auth: {
    signIn: jest.fn().mockResolvedValue({
      user: { email: 'test2@gmail.com' },
      session: { access_token: 'mockAccessToken' },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
};