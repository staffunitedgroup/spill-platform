import { Suspense } from "react";
import { AuthVerify } from "./auth-verify";
import "../spill-game.css";

// /spill/auth?token=… — where the emailed sign-in link lands.
export default function SpillAuthPage() {
  return (
    <main className="s42App sgApp opApp">
      <section className="s42Setup">
        <div className="s42SetupPanel">
          <Suspense fallback={<p className="s42Permission">Signing you in…</p>}>
            <AuthVerify />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
