import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthGate } from "../features/auth/AuthGate";
import { AuthProvider } from "../features/auth/AuthProvider";
import { useAuth } from "../features/auth/useAuth";
import type { Database } from "../lib/supabase/database.types";

const session = {
  access_token: "test-access-token",
  refresh_token: "test-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: { id: "84662d76-271b-40c8-9ce7-29fb621efe56", email: "student@example.com" },
} as Session;

function makeClient(
  initial: Promise<{ data: { session: Session | null }; error: null }>,
  captureAuthCallback?: (callback: (event: string, session: Session | null) => void) => void,
) {
  return {
    auth: {
      getSession: vi.fn(() => initial),
      onAuthStateChange: vi.fn((callback) => {
        captureAuthCallback?.(callback);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  } as unknown as SupabaseClient<Database>;
}

describe("authentication boundary", () => {
  it("shows an initial session loading state", () => {
    const never = new Promise<{ data: { session: Session | null }; error: null }>(() => undefined);
    render(<AuthProvider client={makeClient(never)}><AuthGate><div>Private app</div></AuthGate></AuthProvider>);
    expect(screen.getByText("Restoring your session…")).toBeInTheDocument();
    expect(screen.queryByText("Private app")).not.toBeInTheDocument();
  });

  it("shows the signed-out authentication screen and does not mount the private app", async () => {
    render(
      <AuthProvider client={makeClient(Promise.resolve({ data: { session: null }, error: null }))}>
        <AuthGate><div>Private app</div></AuthGate>
      </AuthProvider>,
    );
    expect(await screen.findByText("Sign in to your charts")).toBeInTheDocument();
    expect(screen.queryByText("Private app")).not.toBeInTheDocument();
  });

  it("clears the active session immediately when sign-out begins", async () => {
    let finishSignOut!: (value: { error: null }) => void;
    const client = makeClient(Promise.resolve({ data: { session }, error: null }));
    vi.mocked(client.auth.signOut).mockReturnValue(new Promise((resolve) => { finishSignOut = resolve; }) as ReturnType<typeof client.auth.signOut>);

    function Probe() {
      const auth = useAuth();
      return <><span>{auth.status}</span><button onClick={() => void auth.signOut()}>Sign out now</button></>;
    }

    render(<AuthProvider client={client}><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("authenticated")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Sign out now"));
    expect(screen.getByText("signed-out")).toBeInTheDocument();
    finishSignOut({ error: null });
  });

  it("does not let stale session restoration overwrite a newer auth event", async () => {
    let resolveInitial!: (value: { data: { session: Session | null }; error: null }) => void;
    let emitAuth!: (event: string, session: Session | null) => void;
    const initial = new Promise<{ data: { session: Session | null }; error: null }>((resolve) => {
      resolveInitial = resolve;
    });
    const client = makeClient(initial, (callback) => { emitAuth = callback; });

    function Probe() {
      const auth = useAuth();
      return <span>{auth.status}:{auth.user?.email ?? "none"}</span>;
    }

    render(<AuthProvider client={client}><Probe /></AuthProvider>);
    act(() => emitAuth("SIGNED_IN", session));
    expect(screen.getByText("authenticated:student@example.com")).toBeInTheDocument();
    await act(async () => {
      resolveInitial({ data: { session: null }, error: null });
      await initial;
    });
    expect(screen.getByText("authenticated:student@example.com")).toBeInTheDocument();
  });
});
